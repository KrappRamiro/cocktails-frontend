/**
 * Composable que sincroniza el tema con un query param `?tema=claro|oscuro`
 * en la URL, además del `localStorage` que maneja el store.
 *
 * Cuando el user comparte un link con `?tema=claro`, el visitante ve esa variante
 * aunque su preferencia local sea otra (la preferencia local NO se sobrescribe).
 */

import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'

const URL_TO_THEME = {
  claro: 'light',
  oscuro: 'dark',
} as const

const THEME_TO_URL = {
  light: 'claro',
  dark: 'oscuro',
} as const

export function useTheme() {
  const store = useThemeStore()
  const route = useRoute()
  const router = useRouter()

  // Si hay ?tema= en la URL al entrar, alineá el store con ese valor.
  const urlTheme = route.query.tema as keyof typeof URL_TO_THEME | undefined
  if (urlTheme && URL_TO_THEME[urlTheme] && store.theme !== URL_TO_THEME[urlTheme]) {
    store.setTheme(URL_TO_THEME[urlTheme])
  }

  // Sincronizar cambios posteriores hacia la URL, sin recargar.
  watch(
    () => store.theme,
    (next) => {
      const desired = THEME_TO_URL[next]
      const current = route.query.tema
      if (current === desired) return

      const query = { ...route.query }
      // Sólo persistir `tema` en URL cuando difiere del default (oscuro)
      if (next === 'dark') delete query.tema
      else query.tema = desired
      router.replace({ query })
    },
  )

  return {
    theme: computed(() => store.theme),
    setTheme: store.setTheme,
    toggle: store.toggle,
  }
}
