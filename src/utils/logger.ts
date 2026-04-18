/**
 * Logger estructurado con niveles configurables por entorno.
 *
 * Usa `VITE_LOG_LEVEL` para controlar verbosidad:
 * - `debug`: todo (API calls, state changes, lifecycle)
 * - `info`: operaciones relevantes (fetch OK, filtro cambiado)
 * - `warn`: situaciones inesperadas pero recuperables
 * - `error`: fallos que afectan funcionalidad
 *
 * @example
 * const log = createLogger('useCocktails')
 * log.debug('Fetching cocktails', { filters })
 * log.error('API call failed', { status: 500, url })
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const
type LogLevel = keyof typeof LEVELS

function getConfiguredLevel(): LogLevel {
  const envLevel = import.meta.env.VITE_LOG_LEVEL as string | undefined
  if (envLevel && envLevel in LEVELS) return envLevel as LogLevel
  return import.meta.env.DEV ? 'debug' : 'info'
}

function timestamp(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export function createLogger(module: string) {
  const minLevel = getConfiguredLevel()

  function log(level: LogLevel, message: string, data?: unknown) {
    if (LEVELS[level] < LEVELS[minLevel]) return
    const prefix = `[${timestamp()}] [${level.toUpperCase()}] [${module}]`
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
    if (data !== undefined) {
      fn(prefix, message, data)
    } else {
      fn(prefix, message)
    }
  }

  return {
    debug: (message: string, data?: unknown) => log('debug', message, data),
    info: (message: string, data?: unknown) => log('info', message, data),
    warn: (message: string, data?: unknown) => log('warn', message, data),
    error: (message: string, data?: unknown) => log('error', message, data),
  }
}
