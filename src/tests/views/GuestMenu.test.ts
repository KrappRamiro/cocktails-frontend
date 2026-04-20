import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import GuestMenu from '@/views/GuestMenu.vue'
import { makeCocktail, makeStats } from '@/tests/fixtures'
import type { Ref } from 'vue'
import { ref } from 'vue'

// Mock useCocktails
const mockCocktails = ref([]) as Ref<any[]>
const mockStats = ref(makeStats({ total: 0, available: 0 }))
const mockLoading = ref(true)
const mockError = ref(null)
const mockSelectedBase = ref(null)
const mockSelectedTaste = ref(null)
const mockSearchQuery = ref('')

vi.mock('@/composables/useCocktails', () => ({
  useCocktails: () => ({
    cocktails: mockCocktails,
    stats: mockStats,
    loading: mockLoading,
    error: mockError,
    selectedBase: mockSelectedBase,
    selectedTaste: mockSelectedTaste,
    searchQuery: mockSearchQuery,
  }),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: GuestMenu },
    { path: '/admin', component: { template: '<div />' } },
  ],
})

function mountGuest() {
  return mount(GuestMenu, {
    global: {
      plugins: [createPinia(), router],
    },
  })
}

describe('GuestMenu', () => {
  beforeEach(() => {
    mockCocktails.value = []
    mockStats.value = makeStats({ total: 0, available: 0 })
    mockLoading.value = true
    mockError.value = null
    mockSelectedBase.value = null
    mockSelectedTaste.value = null
    mockSearchQuery.value = ''
  })

  it('shows skeletons when loading', () => {
    const wrapper = mountGuest()
    // CocktailCardSkeleton has animate-pulse class
    expect(wrapper.findAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows "El menú se publicará pronto" when no cocktails and 0 available', async () => {
    mockLoading.value = false
    mockStats.value = makeStats({ total: 0, available: 0 })
    const wrapper = mountGuest()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('El menú se publicará pronto')
  })

  it('shows empty-state copy when filtered to empty', async () => {
    mockLoading.value = false
    mockStats.value = makeStats({ total: 45, available: 12 })
    mockCocktails.value = []
    const wrapper = mountGuest()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Nada coincide con tu búsqueda')
  })

  it('renders CocktailCards when cocktails exist', async () => {
    mockLoading.value = false
    mockCocktails.value = [makeCocktail(), makeCocktail({ id: 'c2', name: 'Moscow Mule' })]
    mockStats.value = makeStats({ available: 2 })
    const wrapper = mountGuest()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Martini Clásico')
    expect(wrapper.text()).toContain('Moscow Mule')
  })

  it('shows available count in header when not loading', async () => {
    mockLoading.value = false
    mockStats.value = makeStats({ available: 7 })
    const wrapper = mountGuest()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('7 tragos disponibles esta noche')
  })

  it('renders FilterBar', () => {
    const wrapper = mountGuest()
    // FilterBar renders tab buttons with role="tab"
    expect(wrapper.findAll('[role="tab"]').length).toBeGreaterThan(0)
  })
})
