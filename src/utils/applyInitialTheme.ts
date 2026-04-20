/**
 * Aplica la clase de tema (theme-dark | theme-light) al <html> antes del mount
 * de Vue, para evitar flash-of-wrong-theme.
 *
 * Prioridad:
 *  1. ?tema=claro | ?tema=oscuro en la URL (permite links compartibles)
 *  2. localStorage.theme
 *  3. window.matchMedia('(prefers-color-scheme: dark)')
 *  4. Default: oscuro (Speakeasy)
 */

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'

  const params = new URLSearchParams(window.location.search)
  const urlTheme = params.get('tema')
  if (urlTheme === 'claro') return 'light'
  if (urlTheme === 'oscuro') return 'dark'

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'

  return 'dark'
}

export function applyThemeClass(theme: Theme): void {
  const root = document.documentElement
  root.classList.remove('theme-dark', 'theme-light')
  root.classList.add(`theme-${theme}`)
}

export function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore (private mode, disabled storage)
  }
}

export function applyInitialTheme(): void {
  applyThemeClass(getInitialTheme())
}
