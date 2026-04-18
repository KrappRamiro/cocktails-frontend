import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(ConfirmDialog, {
    props: {
      open: true,
      title: 'Eliminar Mojito',
      message: 'Esta acción no se puede deshacer.',
      ...props,
    },
    attachTo: document.body,
  })
}

describe('ConfirmDialog', () => {
  it('does not render when open=false', () => {
    const wrapper = mount(ConfirmDialog, {
      props: { open: false, title: 'X', message: 'Y' },
      attachTo: document.body,
    })
    expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    wrapper.unmount()
  })

  it('renders alertdialog when open=true', () => {
    const wrapper = mountDialog()
    expect(document.querySelector('[role="alertdialog"]')).not.toBeNull()
    wrapper.unmount()
  })

  it('displays title and message', () => {
    const wrapper = mountDialog()
    expect(document.body.textContent).toContain('Eliminar Mojito')
    expect(document.body.textContent).toContain('Esta acción no se puede deshacer.')
    wrapper.unmount()
  })

  it('defaults confirmLabel to Confirmar', () => {
    const wrapper = mountDialog()
    const buttons = document.querySelectorAll('button')
    const confirmBtn = Array.from(buttons).find((b) => b.textContent?.includes('Confirmar'))
    expect(confirmBtn).toBeTruthy()
    wrapper.unmount()
  })

  it('applies red classes for danger style', () => {
    const wrapper = mountDialog({ confirmStyle: 'danger', confirmLabel: 'Eliminar' })
    const buttons = document.querySelectorAll('button')
    const confirmBtn = Array.from(buttons).find((b) => b.textContent?.includes('Eliminar'))
    expect(confirmBtn?.className).toContain('bg-red-600')
    wrapper.unmount()
  })

  it('applies sky classes for default style', () => {
    const wrapper = mountDialog({ confirmStyle: 'default' })
    const buttons = document.querySelectorAll('button')
    const confirmBtn = Array.from(buttons).find((b) => b.textContent?.includes('Confirmar'))
    expect(confirmBtn?.className).toContain('bg-sky-600')
    wrapper.unmount()
  })

  it('emits confirm when confirm button clicked', async () => {
    const wrapper = mountDialog({ confirmLabel: 'OK' })
    const buttons = document.querySelectorAll('button')
    const confirmBtn = Array.from(buttons).find((b) => b.textContent?.includes('OK'))
    confirmBtn?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits cancel when cancel button clicked', async () => {
    const wrapper = mountDialog()
    const buttons = document.querySelectorAll('button')
    const cancelBtn = Array.from(buttons).find((b) => b.textContent?.includes('Cancelar'))
    cancelBtn?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('cancel')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits cancel when backdrop clicked', async () => {
    const wrapper = mountDialog()
    const backdrop = document.querySelector('.bg-black\\/50') as HTMLElement
    backdrop?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('cancel')).toBeTruthy()
    wrapper.unmount()
  })
})
