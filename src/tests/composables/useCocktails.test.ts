/**
 * Tests for useCocktails composable.
 *
 * The composable uses useRoute/useRouter, so it must be exercised inside a
 * real Vue component mounted with a router instance.
 *
 * Note: In Vue 3, refs returned from setup() are automatically unwrapped by
 * the component proxy. So wrapper.vm.loading returns a plain boolean, not a Ref.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createTestingPinia } from '@pinia/testing'
import { useCocktails } from '@/composables/useCocktails'
import { makeCocktail, makeStats } from '@/tests/fixtures'
import type { CocktailsResponse, CocktailBase } from '@/types'

// ─── Mock the api client module ───────────────────────────────────────────────
// vi.hoisted() runs before vi.mock hoisting, making mockGet available to the mock factory.
const { mockGet } = vi.hoisted(() => {
  const mockGet = vi.fn()
  return { mockGet }
})

vi.mock('@/api/client', () => ({
  createApiClient: () => ({ get: mockGet }),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** A thin wrapper component that calls useCocktails() and exposes its state. */
const WrapperComponent = defineComponent({
  setup() {
    return useCocktails()
  },
  template: '<div />',
})

// Type alias for the unwrapped vm — refs are auto-unwrapped by the component proxy
type WrapperVm = {
  loading: boolean
  error: string | null
  cocktails: ReturnType<typeof makeCocktail>[]
  stats: ReturnType<typeof makeStats>
  selectedBase: CocktailBase | null
  selectedTaste: string | null
}

function makeRouter(query: Record<string, string> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  const qs = new URLSearchParams(query).toString()
  router.push(qs ? `/?${qs}` : '/')
  return router
}

function makeDefaultResponse(overrides: Partial<CocktailsResponse> = {}): CocktailsResponse {
  return {
    cocktails: [makeCocktail()],
    stats: makeStats(),
    ...overrides,
  }
}

async function mountWrapper(options: { query?: Record<string, string> } = {}) {
  const router = makeRouter(options.query)
  await router.isReady()

  // stubActions: true (default) replaces all store actions with vi.fn() spies.
  // This lets us assert that toast.show was called without running the real implementation.
  const pinia = createTestingPinia({ createSpy: vi.fn })

  const wrapper = mount(WrapperComponent, {
    global: { plugins: [router, pinia] },
  })

  return { wrapper, router }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useCocktails', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
    // Reset document.hidden if any test changed it
    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true })
  })

  // ── Initial fetch ────────────────────────────────────────────────────────

  it('calls fetchCocktails with ?available=true on mount', async () => {
    mockGet.mockResolvedValueOnce(makeDefaultResponse())

    const { wrapper } = await mountWrapper()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('available=true'))
    wrapper.unmount()
  })

  it('loading starts true and becomes false after fetch resolves', async () => {
    let resolveGet!: (v: CocktailsResponse) => void
    mockGet.mockReturnValueOnce(new Promise<CocktailsResponse>((res) => { resolveGet = res }))

    const { wrapper } = await mountWrapper()

    // loading is true while fetch is in-flight
    expect((wrapper.vm as unknown as WrapperVm).loading).toBe(true)

    resolveGet(makeDefaultResponse())
    // flush multiple microtask ticks for the async fetch chain to settle
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 10))
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as unknown as WrapperVm).loading).toBe(false)
    wrapper.unmount()
  })

  it('populates cocktails and stats from response', async () => {
    const response = makeDefaultResponse({
      cocktails: [makeCocktail({ name: 'Negroni' })],
      stats: makeStats({ total: 10, available: 5 }),
    })
    mockGet.mockResolvedValueOnce(response)

    const { wrapper } = await mountWrapper()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as unknown as WrapperVm
    expect(vm.cocktails).toHaveLength(1)
    expect(vm.cocktails[0].name).toBe('Negroni')
    expect(vm.stats.total).toBe(10)
    expect(vm.stats.available).toBe(5)
    wrapper.unmount()
  })

  // ── Error handling ───────────────────────────────────────────────────────

  it('sets error and calls toast.show on fetch failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network failure'))

    const { wrapper } = await mountWrapper()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const vm = wrapper.vm as unknown as WrapperVm
    expect(vm.error).toBe('Network failure')

    // The toast store's show action should have been called
    const { useToastStore } = await import('@/stores/toastStore')
    const toast = useToastStore()
    expect(toast.show).toHaveBeenCalledWith('Error al cargar el menú', 'error')
    wrapper.unmount()
  })

  // ── Filter / URL sync ────────────────────────────────────────────────────

  it('setting selectedBase triggers router.replace with base query param', async () => {
    mockGet.mockResolvedValue(makeDefaultResponse())

    const { wrapper, router } = await mountWrapper()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const replaceSpy = vi.spyOn(router, 'replace')

    // Mutate the reactive ref through the component proxy
    ;(wrapper.vm as unknown as WrapperVm).selectedBase = 'gin'
    await wrapper.vm.$nextTick()

    expect(replaceSpy).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.objectContaining({ base: 'gin' }) }),
    )
    wrapper.unmount()
  })

  // ── Debounce ─────────────────────────────────────────────────────────────

  it('filter change triggers new fetch after 150ms debounce', async () => {
    vi.useFakeTimers()
    mockGet.mockResolvedValue(makeDefaultResponse())

    const { wrapper } = await mountWrapper()
    await vi.runAllTicks()

    mockGet.mockClear()

    ;(wrapper.vm as unknown as WrapperVm).selectedBase = 'vodka'
    await vi.runAllTicks()

    // Before the debounce timer fires — no extra fetch
    expect(mockGet).not.toHaveBeenCalled()

    vi.advanceTimersByTime(150)
    await vi.runAllTicks()

    expect(mockGet).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('two rapid filter changes result in only one fetch (debounce)', async () => {
    vi.useFakeTimers()
    mockGet.mockResolvedValue(makeDefaultResponse())

    const { wrapper } = await mountWrapper()
    await vi.runAllTicks()

    mockGet.mockClear()

    ;(wrapper.vm as unknown as WrapperVm).selectedBase = 'vodka'
    await vi.runAllTicks()
    ;(wrapper.vm as unknown as WrapperVm).selectedBase = 'gin'
    await vi.runAllTicks()

    vi.advanceTimersByTime(150)
    await vi.runAllTicks()

    expect(mockGet).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  // ── Auto-refresh ─────────────────────────────────────────────────────────

  it('after 60000ms auto-refresh fetches again', async () => {
    vi.useFakeTimers()
    mockGet.mockResolvedValue(makeDefaultResponse())

    const { wrapper } = await mountWrapper()
    await vi.runAllTicks()

    const callsBefore = mockGet.mock.calls.length

    vi.advanceTimersByTime(60_000)
    await vi.runAllTicks()

    expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore)
    wrapper.unmount()
  })

  // ── Visibility ───────────────────────────────────────────────────────────

  it('document.hidden=true + visibilitychange pauses interval', async () => {
    vi.useFakeTimers()
    mockGet.mockResolvedValue(makeDefaultResponse())

    const { wrapper } = await mountWrapper()
    await vi.runAllTicks()

    // Simulate tab going hidden
    Object.defineProperty(document, 'hidden', { value: true, configurable: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.runAllTicks()

    mockGet.mockClear()

    // Advance past refresh interval — no fetch because polling stopped
    vi.advanceTimersByTime(60_000)
    await vi.runAllTicks()

    expect(mockGet).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('document.hidden=false resumes and fetches immediately', async () => {
    vi.useFakeTimers()
    mockGet.mockResolvedValue(makeDefaultResponse())

    const { wrapper } = await mountWrapper()
    await vi.runAllTicks()

    // Hide first
    Object.defineProperty(document, 'hidden', { value: true, configurable: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.runAllTicks()

    mockGet.mockClear()

    // Show again
    Object.defineProperty(document, 'hidden', { value: false, configurable: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.runAllTicks()

    // Should have fetched at least once immediately on resume
    expect(mockGet).toHaveBeenCalled()
    wrapper.unmount()
  })

  // ── Cleanup ───────────────────────────────────────────────────────────────

  it('onUnmounted cleans up interval and event listener', async () => {
    vi.useFakeTimers()
    mockGet.mockResolvedValue(makeDefaultResponse())
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const removeListenerSpy = vi.spyOn(document, 'removeEventListener')

    const { wrapper } = await mountWrapper()
    await vi.runAllTicks()

    wrapper.unmount()
    await vi.runAllTicks()

    expect(clearIntervalSpy).toHaveBeenCalled()
    expect(removeListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
