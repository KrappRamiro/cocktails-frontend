import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IngredientToggle from '@/components/IngredientToggle.vue'
import { makeIngredient } from '@/tests/fixtures'

function mountToggle(overrides: Record<string, unknown> = {}) {
  return mount(IngredientToggle, {
    props: {
      ingredient: makeIngredient(overrides),
    },
  })
}

describe('IngredientToggle', () => {
  it('renders a switch with role="switch"', () => {
    const wrapper = mountToggle()
    expect(wrapper.find('[role="switch"]').exists()).toBe(true)
  })

  it('has aria-checked=true when ingredient is available', () => {
    const wrapper = mountToggle({ is_available: true })
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('true')
  })

  it('has aria-checked=false when ingredient is not available', () => {
    const wrapper = mountToggle({ is_available: false })
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false')
  })

  it('displays ingredient name', () => {
    const wrapper = mountToggle({ name: 'Vodka (neutro)' })
    expect(wrapper.text()).toContain('Vodka (neutro)')
  })

  it('applies accent class when available', () => {
    const wrapper = mountToggle({ is_available: true })
    expect(wrapper.find('[role="switch"]').classes()).toContain('bg-accent')
  })

  it('applies muted class when not available', () => {
    const wrapper = mountToggle({ is_available: false })
    expect(wrapper.find('[role="switch"]').classes()).toContain('bg-elevated')
  })

  it('emits toggle when switch clicked', async () => {
    const wrapper = mountToggle()
    await wrapper.find('[role="switch"]').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('emits edit when edit button clicked', async () => {
    const wrapper = mountToggle()
    const editBtn = wrapper.find('[aria-label="Editar ingrediente"]')
    await editBtn.trigger('click')
    expect(wrapper.emitted('edit')).toHaveLength(1)
  })

  it('emits delete when delete button clicked', async () => {
    const wrapper = mountToggle()
    const deleteBtn = wrapper.find('[aria-label="Eliminar ingrediente"]')
    await deleteBtn.trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
  })

  it('includes ingredient name in switch aria-label', () => {
    const wrapper = mountToggle({ name: 'Ron añejo' })
    const label = wrapper.find('[role="switch"]').attributes('aria-label')
    expect(label).toContain('Ron añejo')
  })
})
