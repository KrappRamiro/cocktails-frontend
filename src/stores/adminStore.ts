/**
 * Store central del panel admin. Coordina estado compartido entre
 * el tab de ingredientes, el tab de recetas y la vista previa.
 *
 * Cuando el admin togglea un ingrediente, la disponibilidad de cocktails cambia.
 * El tab "Vista previa" necesita recalcular. Este store centraliza ese estado.
 */

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { createApiClient } from '@/api/client'
import { createLogger } from '@/utils/logger'
import { useToastStore } from '@/stores/toastStore'
import { categoryOrder, baseLabel } from '@/utils/cocktailColors'
import type {
  Ingredient,
  CocktailWithAvailability,
  CocktailsResponse,
  IngredientPayload,
  IngredientAvailabilityPayload,
  CocktailPayload,
  CocktailBase,
} from '@/types'
import { ApiError } from '@/types'

const log = createLogger('adminStore')

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'

export const useAdminStore = defineStore('admin', () => {
  const router = useRouter()
  const toast = useToastStore()

  // ─── State ──────────────────────────────────────────────────────────────────

  const authToken = ref<string | null>(sessionStorage.getItem('adminToken'))
  const ingredients = ref<Ingredient[]>([])
  const cocktails = ref<CocktailWithAvailability[]>([])
  const loading = ref(false)
  const syncStatus = ref<SyncStatus>('idle')

  // ─── Internals ──────────────────────────────────────────────────────────────

  function api() {
    return createApiClient({ authToken: authToken.value ?? undefined })
  }

  function setSyncSaved() {
    syncStatus.value = 'saved'
    setTimeout(() => {
      if (syncStatus.value === 'saved') syncStatus.value = 'idle'
    }, 2000)
  }

  function handleError(action: string, err: unknown) {
    syncStatus.value = 'error'
    const message = err instanceof ApiError ? err.body : String(err)
    log.error(`${action} failed`, err)
    toast.show(message, 'error')

    // Auto-logout on 401
    if (err instanceof ApiError && err.status === 401) {
      logout()
    }
  }

  async function fetchIngredients() {
    // El endpoint pagina a 20 items por página para evitar un límite del Wasm runtime.
    // Fetcheamos todas las páginas y concatenamos.
    const allIngredients: Ingredient[] = []
    let page = 1
    const limit = 20

    while (true) {
      const data = await api().get<{
        ingredients: Ingredient[]
        pagination: { page: number; limit: number; total: number; total_pages: number }
      }>(`/api/ingredients?page=${page}&limit=${limit}`)

      allIngredients.push(...data.ingredients)

      if (page >= data.pagination.total_pages) break
      page++
    }

    ingredients.value = allIngredients
  }

  async function fetchCocktails() {
    const data = await api().get<CocktailsResponse>('/api/admin/cocktails')
    cocktails.value = data.cocktails
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => authToken.value !== null)

  const ingredientsByCategory = computed(() => {
    return categoryOrder.map((cat) => ({
      key: cat.key,
      label: cat.label,
      items: ingredients.value.filter((i) => i.category === cat.key),
    }))
  })

  const availabilityStats = computed(() => {
    const bases = Object.keys(baseLabel) as CocktailBase[]
    const stats = bases.map((base) => {
      const matching = cocktails.value.filter((c) => c.base === base)
      return {
        base,
        label: baseLabel[base],
        available: matching.filter((c) => c.is_available).length,
        total: matching.length,
      }
    })
    const totalAvailable = cocktails.value.filter((c) => c.is_available).length
    return { byBase: stats, total: cocktails.value.length, available: totalAvailable }
  })

  // ─── Auth actions ───────────────────────────────────────────────────────────

  async function login(user: string, pass: string): Promise<boolean> {
    log.info('Login attempt')
    const token = btoa(`${user}:${pass}`)
    authToken.value = token
    sessionStorage.setItem('adminToken', token)

    try {
      loading.value = true
      // Step 1: validate credentials — if this 401s, credentials are wrong
      await fetchCocktails()
      log.info('Login successful — credentials valid')
    } catch (err) {
      // Auth failed
      log.warn('Login failed', err)
      authToken.value = null
      sessionStorage.removeItem('adminToken')
      toast.show('Credenciales incorrectas', 'error')
      return false
    }

    try {
      // Step 2: load ingredients — failure here is NOT an auth error
      await fetchIngredients()
    } catch (err) {
      log.error('Failed to load ingredients after login', err)
      toast.show('Error al cargar ingredientes', 'error')
      // Don't logout — auth is valid, just data loading failed
    } finally {
      loading.value = false
    }

    return true
  }

  function logout() {
    log.info('Logout')
    authToken.value = null
    ingredients.value = []
    cocktails.value = []
    sessionStorage.removeItem('adminToken')
    router.push('/admin')
  }

  async function init() {
    if (!authToken.value) return
    log.info('Initializing admin store from sessionStorage')
    try {
      loading.value = true
      await fetchCocktails()
      await fetchIngredients()
    } catch (err) {
      handleError('init', err)
    } finally {
      loading.value = false
    }
  }

  // ─── Ingredient actions ─────────────────────────────────────────────────────

  async function toggleIngredient(id: string) {
    const ingredient = ingredients.value.find((i) => i.id === id)
    if (!ingredient) return

    // Optimistic update
    const previousValue = ingredient.is_available
    ingredient.is_available = !previousValue
    syncStatus.value = 'saving'
    log.info('toggleIngredient', { id, available: !previousValue })

    try {
      const payload: IngredientAvailabilityPayload = { available: !previousValue }
      await api().patch(`/api/admin/ingredients/${id}/available`, payload)
      await fetchCocktails() // Availability may have changed
      setSyncSaved()
    } catch (err) {
      ingredient.is_available = previousValue // Revert
      handleError('toggleIngredient', err)
    }
  }

  async function createIngredient(payload: IngredientPayload) {
    syncStatus.value = 'saving'
    log.info('createIngredient', payload)
    try {
      await api().post('/api/admin/ingredients', payload)
      await fetchIngredients()
      setSyncSaved()
      toast.show('Ingrediente creado', 'success')
    } catch (err) {
      handleError('createIngredient', err)
    }
  }

  async function updateIngredient(id: string, payload: IngredientPayload) {
    syncStatus.value = 'saving'
    log.info('updateIngredient', { id, ...payload })
    try {
      await api().put(`/api/admin/ingredients/${id}`, payload)
      await fetchIngredients()
      setSyncSaved()
      toast.show('Ingrediente actualizado', 'success')
    } catch (err) {
      handleError('updateIngredient', err)
    }
  }

  async function deleteIngredient(id: string) {
    syncStatus.value = 'saving'
    log.info('deleteIngredient', { id })
    try {
      await api().delete(`/api/admin/ingredients/${id}`)
      await fetchIngredients()
      setSyncSaved()
      toast.show('Ingrediente eliminado', 'success')
    } catch (err) {
      handleError('deleteIngredient', err)
    }
  }

  // ─── Cocktail actions ───────────────────────────────────────────────────────

  async function createCocktail(payload: CocktailPayload) {
    syncStatus.value = 'saving'
    log.info('createCocktail', { name: payload.name })
    try {
      await api().post('/api/admin/cocktails', payload)
      await fetchCocktails()
      setSyncSaved()
      toast.show('Receta creada', 'success')
    } catch (err) {
      handleError('createCocktail', err)
    }
  }

  async function updateCocktail(id: string, payload: CocktailPayload) {
    syncStatus.value = 'saving'
    log.info('updateCocktail', { id, name: payload.name })
    try {
      await api().put(`/api/admin/cocktails/${id}`, payload)
      await fetchCocktails()
      setSyncSaved()
      toast.show('Receta actualizada', 'success')
    } catch (err) {
      handleError('updateCocktail', err)
    }
  }

  async function deleteCocktail(id: string) {
    syncStatus.value = 'saving'
    log.info('deleteCocktail', { id })
    try {
      await api().delete(`/api/admin/cocktails/${id}`)
      await fetchCocktails()
      setSyncSaved()
      toast.show('Receta eliminada', 'success')
    } catch (err) {
      handleError('deleteCocktail', err)
    }
  }

  // ─── Expose ─────────────────────────────────────────────────────────────────

  return {
    // State
    authToken,
    ingredients,
    cocktails,
    loading,
    syncStatus,
    // Getters
    isAuthenticated,
    ingredientsByCategory,
    availabilityStats,
    // Auth
    login,
    logout,
    init,
    // Ingredients
    toggleIngredient,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    // Cocktails
    createCocktail,
    updateCocktail,
    deleteCocktail,
  }
})
