/**
 * Tests for useAdminStore.
 *
 * Strategy:
 *  - vi.mock('@/api/client') replaces createApiClient with a factory that
 *    returns a mock object. Each test controls the mock's return values.
 *  - createTestingPinia() provides a clean Pinia for every test.
 *  - vue-router is provided via createRouter + createMemoryHistory so that
 *    useRouter() inside the store actually works.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApp, defineComponent } from 'vue'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import { ApiError } from '@/types'
import { makeIngredient, makeCocktail } from '@/tests/fixtures'
import { useAdminStore } from '@/stores/adminStore'
import { useToastStore } from '@/stores/toastStore'
import { categoryOrder } from '@/utils/cocktailColors'

// ─── Mock @/api/client ────────────────────────────────────────────────────────
// We define a shared mock object that each test can customise before calling
// the store. The factory is mocked so every call to createApiClient() returns
// this same object.

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/api/client', () => ({
  createApiClient: vi.fn(() => mockApi),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/admin', component: { template: '<div/>' } },
    ],
  })
}

/**
 * Builds a fresh Pinia + real router, installs the router as the active one
 * so that useRouter() inside the store resolves, and returns the store.
 *
 * NOTE: @pinia/testing's createTestingPinia does NOT stub actions by default
 * (stubActions: false) because we want the real logic to run.
 */
async function setup(sessionToken?: string) {
  if (sessionToken) {
    sessionStorage.setItem('adminToken', sessionToken)
  }

  const router = makeRouter()
  await router.push('/')
  await router.isReady()

  // Provide the router as the globally active one. useRouter() uses
  // inject(routerKey) which resolves from the app — we wrap the store creation
  // inside a real Vue app that has both pinia and router installed.
  const pinia = createTestingPinia({ stubActions: false, createSpy: vi.fn })
  setActivePinia(pinia)

  let store: ReturnType<typeof useAdminStore>
  const App = defineComponent({ setup() { store = useAdminStore(); return () => null } })
  const app = createApp(App)
  app.use(pinia)
  app.use(router)
  app.mount(document.createElement('div'))

  return { store: store!, router, pinia }
}

// ─── Default API responses ────────────────────────────────────────────────────

const defaultIngredients = [
  makeIngredient(),
  makeIngredient({ id: 'ing-uuid-002', name: 'Martini Extra Dry', category: 'vermuts_aperitivos' }),
]
const defaultCocktails = [
  makeCocktail(),
  makeCocktail({ id: 'cocktail-uuid-002', name: 'Negroni', base: 'gin', is_available: false }),
]

/** Mock response for the paginated /api/ingredients endpoint */
const ingredientsPageResponse = {
  ingredients: defaultIngredients,
  pagination: { page: 1, limit: 20, total: defaultIngredients.length, total_pages: 1 },
}

function mockSuccessfulFetches() {
  mockApi.get.mockImplementation((path: string) => {
    if (path.startsWith('/api/ingredients')) return Promise.resolve(ingredientsPageResponse)
    if (path === '/api/admin/cocktails') return Promise.resolve({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })
    return Promise.resolve({})
  })
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers()
  // mockReset clears both call history AND queued mock implementations so that
  // persistent mocks (mockRejectedValue without Once) from one test cannot bleed
  // into the next.
  mockApi.get.mockReset()
  mockApi.post.mockReset()
  mockApi.put.mockReset()
  mockApi.patch.mockReset()
  mockApi.delete.mockReset()
  sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

// ─── Auth: login ──────────────────────────────────────────────────────────────

describe('login', () => {
  it('returns true and fetches data on success', async () => {
    mockSuccessfulFetches()
    const { store } = await setup()
    const result = await store.login('admin', 'password')
    expect(result).toBe(true)
    expect(store.ingredients).toHaveLength(defaultIngredients.length)
    expect(store.cocktails).toHaveLength(defaultCocktails.length)
  })

  it('stores the base64 token in authToken and sessionStorage', async () => {
    mockSuccessfulFetches()
    const { store } = await setup()
    await store.login('admin', 'secret')
    const expected = btoa('admin:secret')
    expect(store.authToken).toBe(expected)
    expect(sessionStorage.getItem('adminToken')).toBe(expected)
  })

  it('returns false and clears token on 401 failure', async () => {
    mockApi.get.mockRejectedValueOnce(new ApiError(401, 'Unauthorized', '/api/admin/cocktails'))
    const { store } = await setup()
    const result = await store.login('admin', 'wrongpass')
    expect(result).toBe(false)
    expect(store.authToken).toBeNull()
    expect(sessionStorage.getItem('adminToken')).toBeNull()
  })

  it('returns false and clears token on any API failure', async () => {
    mockApi.get.mockRejectedValueOnce(new ApiError(500, 'Server error', '/api'))
    const { store } = await setup()
    const result = await store.login('admin', 'pass')
    expect(result).toBe(false)
    expect(store.authToken).toBeNull()
  })

  it('sets loading=true during the request and false after', async () => {
    let loadingDuringCall = false
    mockApi.get.mockImplementation(async (path: string) => {
      loadingDuringCall = true
      if (path.startsWith('/api/ingredients')) return ingredientsPageResponse
      return { cocktails: defaultCocktails, stats: { total: 2, available: 1 } }
    })
    const { store } = await setup()
    const promise = store.login('admin', 'pass')
    // loading is set synchronously before the first await in login()
    expect(store.loading).toBe(true)
    await promise
    expect(store.loading).toBe(false)
    expect(loadingDuringCall).toBe(true)
  })

  it('shows an error toast on login failure', async () => {
    mockApi.get.mockRejectedValueOnce(new ApiError(401, 'Bad creds', '/api'))
    const { store, pinia } = await setup()
    await store.login('admin', 'bad')

    const toast = useToastStore(pinia)
    expect(toast.toasts.length).toBeGreaterThan(0)
    expect(toast.toasts[0].type).toBe('error')
  })
})

// ─── isAuthenticated ──────────────────────────────────────────────────────────

describe('isAuthenticated', () => {
  it('returns false when authToken is null', async () => {
    const { store } = await setup()
    expect(store.isAuthenticated).toBe(false)
  })

  it('returns true when a token exists in sessionStorage', async () => {
    const { store } = await setup('existingtoken')
    expect(store.isAuthenticated).toBe(true)
  })

  it('becomes true after a successful login', async () => {
    mockSuccessfulFetches()
    const { store } = await setup()
    await store.login('admin', 'pass')
    expect(store.isAuthenticated).toBe(true)
  })

  it('becomes false after logout', async () => {
    mockSuccessfulFetches()
    const { store } = await setup()
    await store.login('admin', 'pass')
    store.logout()
    expect(store.isAuthenticated).toBe(false)
  })
})

// ─── logout ───────────────────────────────────────────────────────────────────

describe('logout', () => {
  it('clears authToken', async () => {
    mockSuccessfulFetches()
    const { store } = await setup()
    await store.login('admin', 'pass')
    store.logout()
    expect(store.authToken).toBeNull()
  })

  it('clears ingredients and cocktails arrays', async () => {
    mockSuccessfulFetches()
    const { store } = await setup()
    await store.login('admin', 'pass')
    store.logout()
    expect(store.ingredients).toHaveLength(0)
    expect(store.cocktails).toHaveLength(0)
  })

  it('removes adminToken from sessionStorage', async () => {
    mockSuccessfulFetches()
    const { store } = await setup()
    await store.login('admin', 'pass')
    store.logout()
    expect(sessionStorage.getItem('adminToken')).toBeNull()
  })

  it('navigates to /admin route', async () => {
    mockSuccessfulFetches()
    const { store, router } = await setup()
    await store.login('admin', 'pass')
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')
    store.logout()
    // router.push('/admin') is async — wait for it to resolve
    await router.currentRoute.value.path === '/admin' || await new Promise<void>((resolve) => {
      const stop = router.afterEach(() => { stop(); resolve() })
    })
    expect(router.currentRoute.value.path).toBe('/admin')
  })
})

// ─── Auto-logout on 401 ───────────────────────────────────────────────────────

describe('auto-logout on 401', () => {
  it('logs out automatically when any action receives a 401', async () => {
    // Use a pre-existing session token so we start authenticated without login
    const { store } = await setup('existingtoken')
    expect(store.isAuthenticated).toBe(true)

    // Patch fails with 401 → handleError → logout()
    mockApi.patch.mockRejectedValueOnce(new ApiError(401, 'Unauthorized', '/api/admin/ingredients/1/available'))

    store.ingredients = [makeIngredient({ id: 'ing-uuid-001' })]
    await store.toggleIngredient('ing-uuid-001')

    expect(store.authToken).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})

// ─── init ─────────────────────────────────────────────────────────────────────

describe('init', () => {
  it('does nothing when there is no token', async () => {
    const { store } = await setup()
    await store.init()
    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it('fetches data when a token exists', async () => {
    mockSuccessfulFetches()
    const { store } = await setup('existingtoken')
    await store.init()
    expect(store.ingredients).toHaveLength(defaultIngredients.length)
    expect(store.cocktails).toHaveLength(defaultCocktails.length)
  })

  it('sets loading=true during init and false after', async () => {
    mockSuccessfulFetches()
    const { store } = await setup('existingtoken')
    const promise = store.init()
    expect(store.loading).toBe(true)
    await promise
    expect(store.loading).toBe(false)
  })

  it('calls handleError (shows toast, sets syncStatus=error) when fetch fails', async () => {
    mockApi.get.mockRejectedValueOnce(new ApiError(500, 'Server error', '/api'))
    const { store, pinia } = await setup('existingtoken')
    await store.init()
    expect(store.syncStatus).toBe('error')
    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'error')).toBe(true)
  })
})

// ─── toggleIngredient ─────────────────────────────────────────────────────────

describe('toggleIngredient', () => {
  it('does nothing for an unknown id', async () => {
    const { store } = await setup()
    store.ingredients = [makeIngredient({ id: 'ing-uuid-001', is_available: true })]
    await store.toggleIngredient('nonexistent-id')
    expect(mockApi.patch).not.toHaveBeenCalled()
  })

  it('optimistically flips is_available before the request resolves', async () => {
    let resolvePatch!: () => void
    mockApi.patch.mockReturnValueOnce(new Promise<void>((res) => { resolvePatch = res }))
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store } = await setup()
    store.ingredients = [makeIngredient({ id: 'ing-uuid-001', is_available: true })]

    const promise = store.toggleIngredient('ing-uuid-001')
    // Still awaiting patch — optimistic update should already be applied
    expect(store.ingredients[0].is_available).toBe(false)

    resolvePatch()
    await promise
  })

  it('reverts the optimistic update on API failure', async () => {
    mockApi.patch.mockRejectedValueOnce(new ApiError(500, 'Server error', '/api'))
    const { store } = await setup()
    store.ingredients = [makeIngredient({ id: 'ing-uuid-001', is_available: true })]
    await store.toggleIngredient('ing-uuid-001')
    expect(store.ingredients[0].is_available).toBe(true)
  })

  it('sets syncStatus to "saving" during the request', async () => {
    let resolvePatch!: () => void
    mockApi.patch.mockReturnValueOnce(new Promise<void>((res) => { resolvePatch = res }))
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store } = await setup()
    store.ingredients = [makeIngredient({ id: 'ing-uuid-001' })]
    const promise = store.toggleIngredient('ing-uuid-001')
    expect(store.syncStatus).toBe('saving')
    resolvePatch()
    await promise
  })

  it('calls PATCH /api/admin/ingredients/:id/available with correct payload', async () => {
    mockApi.patch.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store } = await setup()
    store.ingredients = [makeIngredient({ id: 'ing-uuid-001', is_available: true })]
    await store.toggleIngredient('ing-uuid-001')

    expect(mockApi.patch).toHaveBeenCalledWith('/api/admin/ingredients/ing-uuid-001/available', { available: false })
  })

  it('refetches cocktails after a successful toggle', async () => {
    mockApi.patch.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store } = await setup()
    store.ingredients = [makeIngredient({ id: 'ing-uuid-001' })]
    await store.toggleIngredient('ing-uuid-001')

    expect(mockApi.get).toHaveBeenCalledWith('/api/admin/cocktails')
  })

  it('transitions syncStatus: saving → saved → idle after 2s', async () => {
    mockApi.patch.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store } = await setup()
    store.ingredients = [makeIngredient({ id: 'ing-uuid-001' })]
    await store.toggleIngredient('ing-uuid-001')

    expect(store.syncStatus).toBe('saved')
    vi.advanceTimersByTime(1999)
    expect(store.syncStatus).toBe('saved')
    vi.advanceTimersByTime(1)
    expect(store.syncStatus).toBe('idle')
  })
})

// ─── CRUD Ingredients ─────────────────────────────────────────────────────────

describe('createIngredient', () => {
  it('calls POST /api/admin/ingredients with the payload', async () => {
    mockApi.post.mockResolvedValueOnce({ id: 'new-id', name: 'Rum', category: 'bases_alcoholicas', is_available: true })
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    const payload = { name: 'Rum', category: 'bases_alcoholicas' as const }
    await store.createIngredient(payload)

    expect(mockApi.post).toHaveBeenCalledWith('/api/admin/ingredients', payload)
  })

  it('refetches ingredients after creation', async () => {
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    await store.createIngredient({ name: 'Rum', category: 'bases_alcoholicas' })
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/api/ingredients'))
  })

  it('shows a success toast', async () => {
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store, pinia } = await setup()
    await store.createIngredient({ name: 'Rum', category: 'bases_alcoholicas' })

    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'success')).toBe(true)
  })

  it('sets syncStatus to error and shows toast on failure', async () => {
    mockApi.post.mockRejectedValueOnce(new ApiError(422, 'Validation error', '/api'))
    const { store, pinia } = await setup()
    await store.createIngredient({ name: '', category: 'bases_alcoholicas' })

    expect(store.syncStatus).toBe('error')
    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'error')).toBe(true)
  })
})

describe('updateIngredient', () => {
  it('calls PUT /api/admin/ingredients/:id with the payload', async () => {
    mockApi.put.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    const payload = { name: 'Gin', category: 'bases_alcoholicas' as const }
    await store.updateIngredient('ing-uuid-001', payload)

    expect(mockApi.put).toHaveBeenCalledWith('/api/admin/ingredients/ing-uuid-001', payload)
  })

  it('refetches ingredients after update', async () => {
    mockApi.put.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    await store.updateIngredient('ing-uuid-001', { name: 'Gin', category: 'bases_alcoholicas' })
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/api/ingredients'))
  })

  it('shows a success toast', async () => {
    mockApi.put.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store, pinia } = await setup()
    await store.updateIngredient('ing-uuid-001', { name: 'Gin', category: 'bases_alcoholicas' })

    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'success')).toBe(true)
  })

  it('transitions syncStatus to saved then idle', async () => {
    mockApi.put.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    await store.updateIngredient('ing-uuid-001', { name: 'Gin', category: 'bases_alcoholicas' })

    expect(store.syncStatus).toBe('saved')
    vi.advanceTimersByTime(2000)
    expect(store.syncStatus).toBe('idle')
  })
})

describe('deleteIngredient', () => {
  it('calls DELETE /api/admin/ingredients/:id', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    await store.deleteIngredient('ing-uuid-001')

    expect(mockApi.delete).toHaveBeenCalledWith('/api/admin/ingredients/ing-uuid-001')
  })

  it('refetches ingredients after deletion', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    await store.deleteIngredient('ing-uuid-001')
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining('/api/ingredients'))
  })

  it('shows a success toast', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store, pinia } = await setup()
    await store.deleteIngredient('ing-uuid-001')

    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'success')).toBe(true)
  })
})

// ─── CRUD Cocktails ───────────────────────────────────────────────────────────

const cocktailPayload = {
  name: 'Spritz',
  base: 'gin' as const,
  taste: ['fresco' as const],
  glass: 'copa_vino' as const,
  description: 'Light aperitivo',
  ingredients: [],
  steps: ['Pour over ice'],
  garnish: 'Orange slice',
  is_adapted: false,
  adaptation_note: null,
  required_ingredients: [],
}

describe('createCocktail', () => {
  it('calls POST /api/admin/cocktails with the payload', async () => {
    mockApi.post.mockResolvedValueOnce({ id: 'new-c' })
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 3, available: 2 } })

    const { store } = await setup()
    await store.createCocktail(cocktailPayload)

    expect(mockApi.post).toHaveBeenCalledWith('/api/admin/cocktails', cocktailPayload)
  })

  it('refetches cocktails after creation', async () => {
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 3, available: 2 } })

    const { store } = await setup()
    await store.createCocktail(cocktailPayload)
    expect(mockApi.get).toHaveBeenCalledWith('/api/admin/cocktails')
  })

  it('shows a success toast', async () => {
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 3, available: 2 } })

    const { store, pinia } = await setup()
    await store.createCocktail(cocktailPayload)

    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'success')).toBe(true)
  })

  it('shows error toast on failure', async () => {
    mockApi.post.mockRejectedValueOnce(new ApiError(400, 'Bad request', '/api'))
    const { store, pinia } = await setup()
    await store.createCocktail(cocktailPayload)

    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'error')).toBe(true)
  })
})

describe('updateCocktail', () => {
  it('calls PUT /api/admin/cocktails/:id with the payload', async () => {
    mockApi.put.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store } = await setup()
    await store.updateCocktail('cocktail-uuid-001', cocktailPayload)

    expect(mockApi.put).toHaveBeenCalledWith('/api/admin/cocktails/cocktail-uuid-001', cocktailPayload)
  })

  it('refetches cocktails after update', async () => {
    mockApi.put.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store } = await setup()
    await store.updateCocktail('cocktail-uuid-001', cocktailPayload)
    expect(mockApi.get).toHaveBeenCalledWith('/api/admin/cocktails')
  })

  it('shows a success toast', async () => {
    mockApi.put.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 2, available: 1 } })

    const { store, pinia } = await setup()
    await store.updateCocktail('cocktail-uuid-001', cocktailPayload)

    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'success')).toBe(true)
  })
})

describe('deleteCocktail', () => {
  it('calls DELETE /api/admin/cocktails/:id', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 1, available: 1 } })

    const { store } = await setup()
    await store.deleteCocktail('cocktail-uuid-001')

    expect(mockApi.delete).toHaveBeenCalledWith('/api/admin/cocktails/cocktail-uuid-001')
  })

  it('refetches cocktails after deletion', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 1, available: 1 } })

    const { store } = await setup()
    await store.deleteCocktail('cocktail-uuid-001')
    expect(mockApi.get).toHaveBeenCalledWith('/api/admin/cocktails')
  })

  it('shows a success toast', async () => {
    mockApi.delete.mockResolvedValueOnce(undefined)
    mockApi.get.mockResolvedValueOnce({ cocktails: defaultCocktails, stats: { total: 1, available: 1 } })

    const { store, pinia } = await setup()
    await store.deleteCocktail('cocktail-uuid-001')

    const toast = useToastStore(pinia)
    expect(toast.toasts.some((t) => t.type === 'success')).toBe(true)
  })
})

// ─── ingredientsByCategory getter ────────────────────────────────────────────

describe('ingredientsByCategory', () => {
  it('groups ingredients into category buckets', async () => {
    const { store } = await setup()
    const gin = makeIngredient({ id: '1', category: 'bases_alcoholicas' })
    const vodka = makeIngredient({ id: '2', name: 'Vodka', category: 'bases_alcoholicas' })
    const lime = makeIngredient({ id: '3', name: 'Jugo de lima', category: 'jugos' })
    store.ingredients = [gin, vodka, lime]

    const byCategory = store.ingredientsByCategory
    const bases = byCategory.find((g) => g.key === 'bases_alcoholicas')
    const jugos = byCategory.find((g) => g.key === 'jugos')
    const licores = byCategory.find((g) => g.key === 'licores')

    expect(bases?.items).toHaveLength(2)
    expect(jugos?.items).toHaveLength(1)
    expect(licores?.items).toHaveLength(0)
  })

  it('returns an entry for every category in categoryOrder', async () => {
    const { store } = await setup()
    store.ingredients = []
    expect(store.ingredientsByCategory).toHaveLength(categoryOrder.length)
  })

  it('each entry has the correct label from categoryOrder', async () => {
    const { store } = await setup()
    store.ingredients = []
    const byCategory = store.ingredientsByCategory
    categoryOrder.forEach((cat) => {
      const entry = byCategory.find((g) => g.key === cat.key)
      expect(entry?.label).toBe(cat.label)
    })
  })
})

// ─── availabilityStats getter ─────────────────────────────────────────────────

describe('availabilityStats', () => {
  it('counts total and available cocktails', async () => {
    const { store } = await setup()
    store.cocktails = [
      makeCocktail({ id: '1', is_available: true }),
      makeCocktail({ id: '2', is_available: false }),
      makeCocktail({ id: '3', is_available: true }),
    ]
    const stats = store.availabilityStats
    expect(stats.total).toBe(3)
    expect(stats.available).toBe(2)
  })

  it('groups counts by base', async () => {
    const { store } = await setup()
    store.cocktails = [
      makeCocktail({ id: '1', base: 'gin', is_available: true }),
      makeCocktail({ id: '2', base: 'gin', is_available: false }),
      makeCocktail({ id: '3', base: 'vodka', is_available: true }),
    ]
    const stats = store.availabilityStats
    const gin = stats.byBase.find((b) => b.base === 'gin')
    const vodka = stats.byBase.find((b) => b.base === 'vodka')

    expect(gin?.total).toBe(2)
    expect(gin?.available).toBe(1)
    expect(vodka?.total).toBe(1)
    expect(vodka?.available).toBe(1)
  })

  it('returns zero counts when cocktails list is empty', async () => {
    const { store } = await setup()
    store.cocktails = []
    const stats = store.availabilityStats
    expect(stats.total).toBe(0)
    expect(stats.available).toBe(0)
    stats.byBase.forEach((b) => {
      expect(b.total).toBe(0)
      expect(b.available).toBe(0)
    })
  })
})

// ─── syncStatus transitions ───────────────────────────────────────────────────

describe('syncStatus transitions', () => {
  it('transitions idle → saving → saved → idle after a successful operation', async () => {
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    expect(store.syncStatus).toBe('idle')

    const promise = store.createIngredient({ name: 'Gin', category: 'bases_alcoholicas' })
    expect(store.syncStatus).toBe('saving')

    await promise
    expect(store.syncStatus).toBe('saved')

    vi.advanceTimersByTime(2000)
    expect(store.syncStatus).toBe('idle')
  })

  it('stays "saved" until 2s timer fires', async () => {
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    await store.createIngredient({ name: 'Gin', category: 'bases_alcoholicas' })
    expect(store.syncStatus).toBe('saved')
    vi.advanceTimersByTime(1999)
    expect(store.syncStatus).toBe('saved')
  })

  it('transitions to "error" on failure', async () => {
    mockApi.post.mockRejectedValueOnce(new ApiError(500, 'Server error', '/api'))
    const { store } = await setup()
    await store.createIngredient({ name: 'Bad', category: 'bases_alcoholicas' })
    expect(store.syncStatus).toBe('error')
  })

  it('does NOT reset to idle if a new operation starts while "saved"', async () => {
    // Per the implementation: only resets if syncStatus === 'saved' at the time of the timeout.
    // Simulate starting a second action that sets syncStatus to 'saving' before the timer fires.
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)

    const { store } = await setup()
    await store.createIngredient({ name: 'First', category: 'bases_alcoholicas' })
    expect(store.syncStatus).toBe('saved')

    // Start a second action before the 2s timer fires
    mockApi.post.mockResolvedValueOnce({})
    mockApi.get.mockResolvedValueOnce(ingredientsPageResponse)
    const secondPromise = store.createIngredient({ name: 'Second', category: 'bases_alcoholicas' })
    expect(store.syncStatus).toBe('saving')

    // First timer fires: syncStatus is 'saving' now so the guard prevents reset to 'idle'
    vi.advanceTimersByTime(2000)
    expect(store.syncStatus).not.toBe('idle')

    // Complete second action
    await secondPromise
    expect(store.syncStatus).toBe('saved')

    // Second timer fires: now it resets to idle
    vi.advanceTimersByTime(2000)
    expect(store.syncStatus).toBe('idle')
  })
})
