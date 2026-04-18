/**
 * Cliente HTTP centralizado para todas las llamadas al backend.
 *
 * Responsabilidades:
 * - Base URL desde `VITE_API_URL` (o relativa si se usa el proxy de Vite en dev)
 * - Headers Content-Type y Authorization (si hay token)
 * - Parseo automático de JSON
 * - Logging de cada request (método, URL, status, duración)
 * - Errores HTTP lanzan `ApiError`
 */

import { ApiError } from '@/types'
import { createLogger } from '@/utils/logger'

const log = createLogger('ApiClient')
const BASE_URL = import.meta.env.VITE_API_URL || ''

interface ClientOptions {
  authToken?: string
}

export function createApiClient(options: ClientOptions = {}) {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${BASE_URL}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (options.authToken) {
      headers['Authorization'] = `Basic ${options.authToken}`
    }

    const start = performance.now()
    let response: Response

    try {
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    } catch (err) {
      const duration = Math.round(performance.now() - start)
      log.error(`${method} ${path} → NETWORK ERROR (${duration}ms)`, err)
      throw new ApiError(0, 'Error de conexión', url)
    }

    const duration = Math.round(performance.now() - start)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error')
      log.error(`${method} ${path} → ${response.status} (${duration}ms)`, errorBody)
      throw new ApiError(response.status, errorBody, url)
    }

    log.debug(`${method} ${path} → ${response.status} (${duration}ms)`)

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
    delete: (path: string) => request<void>('DELETE', path),
  }
}
