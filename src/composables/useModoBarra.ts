/**
 * Composable que sincroniza el modo (invitado | barra) con un query param
 * `?modo=barra` en la URL. Default = invitado (sin param).
 */

import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModoStore, type Modo } from '@/stores/modoStore'

export function useModoBarra() {
  const store = useModoStore()
  const route = useRoute()
  const router = useRouter()

  // Inicializar desde URL si viene
  const urlModo = route.query.modo as string | undefined
  const initial: Modo = urlModo === 'barra' ? 'barra' : 'invitado'
  if (store.modo !== initial) store.setModo(initial)

  // Sincronizar cambios del store hacia URL
  watch(
    () => store.modo,
    (next) => {
      const query = { ...route.query }
      if (next === 'barra') query.modo = 'barra'
      else delete query.modo
      router.replace({ query })
    },
  )

  return {
    modo: computed(() => store.modo),
    setModo: store.setModo,
    toggle: store.toggle,
  }
}
