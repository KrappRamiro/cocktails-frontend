import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must re-import after stubbing env
async function importLogger() {
  // Dynamic import so each test gets a fresh module with the current env
  const mod = await import('@/utils/logger')
  return mod.createLogger
}

describe('createLogger', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an object with debug, info, warn, error methods', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')
    const createLogger = (await import('@/utils/logger')).createLogger
    const log = createLogger('test')
    expect(typeof log.debug).toBe('function')
    expect(typeof log.info).toBe('function')
    expect(typeof log.warn).toBe('function')
    expect(typeof log.error).toBe('function')
  })

  it('includes module name in output', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const createLogger = (await import('@/utils/logger')).createLogger
    const log = createLogger('MyModule')
    log.debug('test message')
    expect(spy).toHaveBeenCalled()
    const prefix = spy.mock.calls[0][0] as string
    expect(prefix).toContain('MyModule')
  })

  it('routes error to console.error', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const createLogger = (await import('@/utils/logger')).createLogger
    const log = createLogger('test')
    log.error('fail')
    expect(spy).toHaveBeenCalled()
  })

  it('routes warn to console.warn', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const createLogger = (await import('@/utils/logger')).createLogger
    const log = createLogger('test')
    log.warn('warning')
    expect(spy).toHaveBeenCalled()
  })

  it('forwards data as second argument when provided', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const createLogger = (await import('@/utils/logger')).createLogger
    const log = createLogger('test')
    const data = { key: 'value' }
    log.info('msg', data)
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'msg', data)
  })

  it('does not forward data when not provided', async () => {
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const createLogger = (await import('@/utils/logger')).createLogger
    const log = createLogger('test')
    log.info('msg')
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'msg')
  })
})
