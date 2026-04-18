import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ToastNotification from '@/components/ToastNotification.vue'
import { useToastStore } from '@/stores/toastStore'

function mountToast() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return {
    wrapper: mount(ToastNotification, {
      global: { plugins: [pinia] },
      attachTo: document.body,
    }),
    store: useToastStore(),
  }
}

describe('ToastNotification', () => {
  it('renders no alerts when toasts is empty', () => {
    const { wrapper } = mountToast()
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(0)
    wrapper.unmount()
  })

  it('renders one alert per toast', () => {
    const { wrapper, store } = mountToast()
    store.toasts = [
      { id: 1, message: 'Guardado', type: 'success' },
      { id: 2, message: 'Error', type: 'error' },
    ]
    // Need nextTick for reactivity
    return wrapper.vm.$nextTick().then(() => {
      expect(document.querySelectorAll('[role="alert"]')).toHaveLength(2)
      wrapper.unmount()
    })
  })

  it('shows correct message text', () => {
    const { wrapper, store } = mountToast()
    store.toasts = [{ id: 1, message: 'Operación exitosa', type: 'info' }]
    return wrapper.vm.$nextTick().then(() => {
      expect(document.body.textContent).toContain('Operación exitosa')
      wrapper.unmount()
    })
  })

  it('applies green class for success', () => {
    const { wrapper, store } = mountToast()
    store.toasts = [{ id: 1, message: 'OK', type: 'success' }]
    return wrapper.vm.$nextTick().then(() => {
      const alert = document.querySelector('[role="alert"]')
      expect(alert?.className).toContain('bg-emerald-600')
      wrapper.unmount()
    })
  })

  it('applies red class for error', () => {
    const { wrapper, store } = mountToast()
    store.toasts = [{ id: 1, message: 'Fail', type: 'error' }]
    return wrapper.vm.$nextTick().then(() => {
      const alert = document.querySelector('[role="alert"]')
      expect(alert?.className).toContain('bg-red-600')
      wrapper.unmount()
    })
  })

  it('applies sky class for info', () => {
    const { wrapper, store } = mountToast()
    store.toasts = [{ id: 1, message: 'Info', type: 'info' }]
    return wrapper.vm.$nextTick().then(() => {
      const alert = document.querySelector('[role="alert"]')
      expect(alert?.className).toContain('bg-sky-600')
      wrapper.unmount()
    })
  })

  it('close button calls dismiss', async () => {
    const { wrapper, store } = mountToast()
    store.toasts = [{ id: 42, message: 'Hello', type: 'info' }]
    await wrapper.vm.$nextTick()
    const closeBtn = document.querySelector('[aria-label="Cerrar notificación"]') as HTMLElement
    closeBtn?.click()
    await wrapper.vm.$nextTick()
    expect(store.toasts).toHaveLength(0)
    wrapper.unmount()
  })
})
