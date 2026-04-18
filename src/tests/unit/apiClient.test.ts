import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApiClient } from '@/api/client'
import { ApiError } from '@/types'

// Helper to build a minimal Response-like object
function makeResponse(status: number, body: string | null, ok?: boolean): Response {
  const resolvedOk = ok !== undefined ? ok : status >= 200 && status < 300
  return {
    ok: resolvedOk,
    status,
    json: () => (body !== null ? Promise.resolve(JSON.parse(body)) : Promise.resolve(undefined)),
    text: () => Promise.resolve(body ?? ''),
  } as unknown as Response
}

describe('createApiClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_API_URL', '')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  // ─── Method + URL ─────────────────────────────────────────────────────────

  it('GET calls fetch with correct method and URL', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, '{"ok":true}'))
    const client = createApiClient()
    await client.get('/api/ingredients')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/ingredients')
    expect(init.method).toBe('GET')
  })

  it('always sends Content-Type: application/json header', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, '{}'))
    const client = createApiClient()
    await client.get('/api/test')
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  // ─── Authorization header ─────────────────────────────────────────────────

  it('adds Authorization header when authToken is provided', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, '{}'))
    const client = createApiClient({ authToken: 'mytoken123' })
    await client.get('/api/admin')
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['Authorization']).toBe('Basic mytoken123')
  })

  it('omits Authorization header when no token is provided', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, '{}'))
    const client = createApiClient()
    await client.get('/api/public')
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  // ─── Response parsing ─────────────────────────────────────────────────────

  it('parses and returns JSON from a 200 response', async () => {
    const payload = { ingredients: [{ id: '1', name: 'Gin' }] }
    fetchMock.mockResolvedValueOnce(makeResponse(200, JSON.stringify(payload)))
    const client = createApiClient()
    const result = await client.get('/api/ingredients')
    expect(result).toEqual(payload)
  })

  it('returns undefined for a 204 No Content response', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(204, null))
    const client = createApiClient()
    const result = await client.delete('/api/admin/ingredients/1')
    expect(result).toBeUndefined()
  })

  // ─── Error handling ───────────────────────────────────────────────────────

  it('throws ApiError with correct status and body on a 4xx response', async () => {
    fetchMock.mockResolvedValue(makeResponse(404, 'Not found', false))
    const client = createApiClient()
    await expect(client.get('/api/missing')).rejects.toThrow(ApiError)
    await expect(client.get('/api/missing')).rejects.toMatchObject({
      status: 404,
      body: 'Not found',
    })
  })

  it('throws ApiError with correct status and body on a 5xx response', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(500, 'Internal Server Error', false))
    const client = createApiClient()
    await expect(client.get('/api/crash')).rejects.toMatchObject({
      status: 500,
      body: 'Internal Server Error',
    })
  })

  it('throws ApiError with status 0 when fetch rejects (network error)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const client = createApiClient()
    let caught: unknown
    try {
      await client.get('/api/whatever')
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(ApiError)
    expect((caught as ApiError).status).toBe(0)
  })

  it('includes the URL in ApiError for network errors', async () => {
    fetchMock.mockRejectedValueOnce(new Error('net::ERR_CONNECTION_REFUSED'))
    const client = createApiClient()
    let caught: unknown
    try {
      await client.get('/api/down')
    } catch (err) {
      caught = err
    }
    expect((caught as ApiError).url).toContain('/api/down')
  })

  // ─── Request body serialization ───────────────────────────────────────────

  it('post serializes body as JSON', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(201, '{"id":"new"}'))
    const client = createApiClient()
    const body = { name: 'Vodka', category: 'bases_alcoholicas' }
    await client.post('/api/admin/ingredients', body)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(body))
  })

  it('put serializes body as JSON', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, '{"id":"1"}'))
    const client = createApiClient()
    const body = { name: 'Gin', category: 'bases_alcoholicas' }
    await client.put('/api/admin/ingredients/1', body)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('PUT')
    expect(init.body).toBe(JSON.stringify(body))
  })

  it('patch serializes body as JSON', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, '{}'))
    const client = createApiClient()
    const body = { available: false }
    await client.patch('/api/admin/ingredients/1/available', body)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('PATCH')
    expect(init.body).toBe(JSON.stringify(body))
  })

  it('delete sends no body', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(204, null))
    const client = createApiClient()
    await client.delete('/api/admin/ingredients/1')
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('DELETE')
    expect(init.body).toBeUndefined()
  })

  // ─── Base URL prefix ──────────────────────────────────────────────────────

  it('prefixes URL with VITE_API_URL when set', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com')
    // We need to re-import the module so it picks up the new env. Since Vite
    // evaluates import.meta.env.VITE_API_URL at module load time, we stub the
    // global fetch and verify it receives the already-evaluated BASE_URL. In
    // the test environment the module is already loaded with BASE_URL=''.
    // To test the prefix behavior we call fetch directly with the expected URL.
    fetchMock.mockResolvedValueOnce(makeResponse(200, '{}'))
    // The module-level BASE_URL is evaluated once. Re-import is not possible
    // in vitest without vi.resetModules(). We use that pattern here.
    vi.resetModules()
    // Re-stub fetch after resetModules so the new module instance picks it up
    vi.stubGlobal('fetch', fetchMock)
    const { createApiClient: freshClient } = await import('@/api/client')
    await freshClient().get('/api/test')
    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.com/api/test')
  })
})
