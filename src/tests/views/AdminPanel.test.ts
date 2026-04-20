import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import AdminPanel from '@/views/AdminPanel.vue'
import { useAdminStore } from '@/stores/adminStore'
import { makeCocktail, makeIngredient } from '@/tests/fixtures'

// Mock the API client so the store doesn't make real calls
vi.mock('@/api/client', () => ({
  createApiClient: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  })),
}))

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/admin', component: AdminPanel },
  ],
})

function mountAdmin(storeOverrides: Record<string, unknown> = {}) {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      admin: {
        authToken: null,
        ingredients: [],
        cocktails: [],
        loading: false,
        syncStatus: 'idle',
        ...storeOverrides,
      },
    },
  })

  const wrapper = mount(AdminPanel, {
    global: {
      plugins: [pinia, router],
    },
    attachTo: document.body,
  })

  const store = useAdminStore()
  return { wrapper, store }
}

describe('AdminPanel', () => {
  describe('Login state', () => {
    it('shows login form when not authenticated', () => {
      const { wrapper } = mountAdmin()
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Panel de administración')
    })

    it('does not show panel content when not authenticated', () => {
      const { wrapper } = mountAdmin()
      expect(wrapper.text()).not.toContain('Cerrar sesión')
    })

    it('calls store.login on form submit', async () => {
      const { wrapper, store } = mountAdmin()
      store.login = vi.fn().mockResolvedValue(true)

      await wrapper.find('#user').setValue('admin')
      await wrapper.find('#pass').setValue('secret')
      await wrapper.find('form').trigger('submit')

      expect(store.login).toHaveBeenCalledWith('admin', 'secret')
      wrapper.unmount()
    })
  })

  describe('Authenticated panel', () => {
    const authState = {
      authToken: btoa('admin:pass'),
      ingredients: [
        makeIngredient({ id: '1', name: 'Gin', category: 'bases_alcoholicas' }),
        makeIngredient({ id: '2', name: 'Tónica', category: 'mixers_gaseosas' }),
      ],
      cocktails: [
        makeCocktail({ id: 'c1', name: 'GT Clásico', base: 'gin_tonics' }),
      ],
    }

    it('shows tab navigation when authenticated', () => {
      const { wrapper } = mountAdmin(authState)
      expect(wrapper.text()).toContain('Ingredientes')
      expect(wrapper.text()).toContain('Recetas')
      expect(wrapper.text()).toContain('Vista previa')
      wrapper.unmount()
    })

    it('shows logout button when authenticated', () => {
      const { wrapper } = mountAdmin(authState)
      expect(wrapper.text()).toContain('Cerrar sesión')
      wrapper.unmount()
    })

    it('calls store.logout when logout clicked', async () => {
      const { wrapper, store } = mountAdmin(authState)
      const logoutBtn = wrapper.findAll('button').find((b) => b.text().includes('Cerrar sesión'))
      await logoutBtn!.trigger('click')
      expect(store.logout).toHaveBeenCalled()
      wrapper.unmount()
    })

    it('defaults to Ingredientes tab', () => {
      const { wrapper } = mountAdmin(authState)
      // Ingredient names should be visible
      expect(wrapper.text()).toContain('Gin')
      expect(wrapper.text()).toContain('Tónica')
      wrapper.unmount()
    })

    it('switches to Recetas tab when clicked', async () => {
      const { wrapper } = mountAdmin(authState)
      const recetasTab = wrapper.findAll('nav button').find((b) => b.text().includes('Recetas'))
      await recetasTab!.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('GT Clásico')
      wrapper.unmount()
    })

    it('switches to Vista previa tab', async () => {
      const { wrapper } = mountAdmin(authState)
      const previewTab = wrapper.findAll('nav button').find((b) => b.text().includes('Vista previa'))
      await previewTab!.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Disponibilidad')
      expect(wrapper.text()).toContain('Ver menú público')
      wrapper.unmount()
    })

    it('shows sync indicator when saving', () => {
      const { wrapper } = mountAdmin({ ...authState, syncStatus: 'saving' })
      expect(wrapper.text()).toContain('Guardando...')
      wrapper.unmount()
    })

    it('shows sync indicator when saved', () => {
      const { wrapper } = mountAdmin({ ...authState, syncStatus: 'saved' })
      expect(wrapper.text()).toContain('Guardado')
      wrapper.unmount()
    })

    it('hides sync indicator when idle', () => {
      const { wrapper } = mountAdmin(authState)
      expect(wrapper.text()).not.toContain('Guardando...')
      expect(wrapper.text()).not.toContain('Guardado')
      wrapper.unmount()
    })
  })
})
