/**
 * Composable para obtener y mantener actualizada la lista de tragos disponibles.
 *
 * - Fetch con filtros opcionales (base, taste)
 * - Auto-refresh cada 60 segundos, pausado cuando el tab no está visible
 * - Filtros sincronizados con URL query params
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createApiClient } from '@/api/client'
import { createLogger } from '@/utils/logger'
import { useToastStore } from '@/stores/toastStore'
import type { CocktailWithAvailability, CocktailsResponse, Stats, CocktailBase, CocktailTaste } from '@/types'

const REFRESH_INTERVAL = 60_000
const FILTER_DEBOUNCE = 150

const log = createLogger('useCocktails')
const api = createApiClient()

export function useCocktails() {
  const route = useRoute()
  const router = useRouter()
  const toast = useToastStore()

  const cocktails = ref<CocktailWithAvailability[]>([])
  const stats = ref<Stats>({ total: 0, available: 0 })
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Filtros — inicializados desde la URL
  const selectedBase = ref<CocktailBase | null>(
    (route.query.base as CocktailBase) || null,
  )
  const selectedTaste = ref<CocktailTaste | null>(
    (route.query.taste as CocktailTaste) || null,
  )

  let intervalId: ReturnType<typeof setInterval> | null = null

  async function fetchCocktails() {
    const params = new URLSearchParams()
    params.set('available', 'true')
    if (selectedBase.value) params.set('base', selectedBase.value)
    if (selectedTaste.value) params.set('taste', selectedTaste.value)

    log.debug('Fetching cocktails', {
      base: selectedBase.value,
      taste: selectedTaste.value,
    })

    try {
      const data = await api.get<CocktailsResponse>(
        `/api/cocktails?${params.toString()}`,
      )
      cocktails.value = data.cocktails
      stats.value = data.stats
      error.value = null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      error.value = message
      log.error('Fetch failed', err)
      toast.show('Error al cargar el menú', 'error')
    } finally {
      loading.value = false
    }
  }

  // Sincronizar filtros con la URL (sin navegar)
  function syncFiltersToUrl() {
    const query: Record<string, string> = {}
    if (selectedBase.value) query.base = selectedBase.value
    if (selectedTaste.value) query.taste = selectedTaste.value
    router.replace({ query })
  }

  // Debounced watch en filtros
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  watch([selectedBase, selectedTaste], () => {
    syncFiltersToUrl()
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      loading.value = true
      fetchCocktails()
    }, FILTER_DEBOUNCE)
  })

  // Visibility-aware auto-refresh
  function startPolling() {
    stopPolling()
    intervalId = setInterval(fetchCocktails, REFRESH_INTERVAL)
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function handleVisibility() {
    if (document.hidden) {
      stopPolling()
      log.debug('Tab hidden, pausing auto-refresh')
    } else {
      fetchCocktails()
      startPolling()
      log.debug('Tab visible, resuming auto-refresh')
    }
  }

  onMounted(() => {
    fetchCocktails()
    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)
  })

  onUnmounted(() => {
    stopPolling()
    document.removeEventListener('visibilitychange', handleVisibility)
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return {
    cocktails,
    stats,
    loading,
    error,
    selectedBase,
    selectedTaste,
  }
}
