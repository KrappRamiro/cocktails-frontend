/**
 * Tests for IngredientForm component.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import IngredientForm from '@/components/IngredientForm.vue'
import { makeIngredient } from '@/tests/fixtures'
import type { Ingredient } from '@/types'
import { categoryOrder } from '@/utils/cocktailColors'

// ─── Helper ───────────────────────────────────────────────────────────────────

function mountForm(ingredient: Ingredient | null = null) {
  return mount(IngredientForm, {
    props: { ingredient },
  })
}

afterEach(() => {
  // nothing to clean per test beyond unmounting
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('IngredientForm', () => {

  // ── Initial state ────────────────────────────────────────────────────

  it('ingredient=null → name input is empty', () => {
    const wrapper = mountForm(null)
    const nameInput = wrapper.find<HTMLInputElement>('input[type="text"]')
    expect(nameInput.element.value).toBe('')
    wrapper.unmount()
  })

  it('ingredient=null → category select is empty (no selection)', () => {
    const wrapper = mountForm(null)
    const select = wrapper.find<HTMLSelectElement>('select')
    expect(select.element.value).toBe('')
    wrapper.unmount()
  })

  it('existing ingredient → name pre-populated', () => {
    const ing = makeIngredient({ name: 'Campari' })
    const wrapper = mountForm(ing)
    const nameInput = wrapper.find<HTMLInputElement>('input[type="text"]')
    expect(nameInput.element.value).toBe('Campari')
    wrapper.unmount()
  })

  it('existing ingredient → category pre-selected', () => {
    const ing = makeIngredient({ category: 'licores' })
    const wrapper = mountForm(ing)
    const select = wrapper.find<HTMLSelectElement>('select')
    expect(select.element.value).toBe('licores')
    wrapper.unmount()
  })

  // ── Guardar disabled logic ────────────────────────────────────────────

  it('Guardar is disabled when name is empty', () => {
    const wrapper = mountForm(null)
    const btn = wrapper.find<HTMLButtonElement>('button[type="submit"]')
    expect(btn.element.disabled).toBe(true)
    wrapper.unmount()
  })

  it('Guardar is disabled when name has only 1 character', async () => {
    const wrapper = mountForm(null)
    const nameInput = wrapper.find<HTMLInputElement>('input[type="text"]')
    await nameInput.setValue('A')
    const select = wrapper.find<HTMLSelectElement>('select')
    await select.setValue('licores')
    const btn = wrapper.find<HTMLButtonElement>('button[type="submit"]')
    expect(btn.element.disabled).toBe(true)
    wrapper.unmount()
  })

  it('Guardar is disabled when no category selected even if name is valid', async () => {
    const wrapper = mountForm(null)
    const nameInput = wrapper.find<HTMLInputElement>('input[type="text"]')
    await nameInput.setValue('Ron añejo')
    const btn = wrapper.find<HTMLButtonElement>('button[type="submit"]')
    expect(btn.element.disabled).toBe(true)
    wrapper.unmount()
  })

  it('Guardar is enabled when name >= 2 chars and category selected', async () => {
    const wrapper = mountForm(null)
    const nameInput = wrapper.find<HTMLInputElement>('input[type="text"]')
    await nameInput.setValue('Ron añejo')
    const select = wrapper.find<HTMLSelectElement>('select')
    await select.setValue('bases_alcoholicas')
    const btn = wrapper.find<HTMLButtonElement>('button[type="submit"]')
    expect(btn.element.disabled).toBe(false)
    wrapper.unmount()
  })

  // ── Submit ───────────────────────────────────────────────────────────

  it('submit emits save with trimmed name and category', async () => {
    const wrapper = mountForm(null)
    const nameInput = wrapper.find<HTMLInputElement>('input[type="text"]')
    await nameInput.setValue('  Vodka Premium  ')
    const select = wrapper.find<HTMLSelectElement>('select')
    await select.setValue('bases_alcoholicas')

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
    expect(emitted![0][0]).toEqual({
      name: 'Vodka Premium',
      category: 'bases_alcoholicas',
    })
    wrapper.unmount()
  })

  it('submit with existing ingredient emits save with current values', async () => {
    const ing = makeIngredient({ name: 'Campari', category: 'amargos' })
    const wrapper = mountForm(ing)

    await wrapper.find('form').trigger('submit')

    const emitted = wrapper.emitted('save')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({
      name: 'Campari',
      category: 'amargos',
    })
    wrapper.unmount()
  })

  // ── Cancel ───────────────────────────────────────────────────────────

  it('Cancelar emits cancel', async () => {
    const wrapper = mountForm(null)
    const cancelBtn = wrapper.find('button[type="button"]')
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
    wrapper.unmount()
  })

  // ── Categories ───────────────────────────────────────────────────────

  it('all 9 categories are present as options', () => {
    const wrapper = mountForm(null)
    const select = wrapper.find('select')
    const options = select.findAll('option')
    // +1 for the disabled placeholder "Seleccionar..."
    expect(options).toHaveLength(categoryOrder.length + 1)

    const optionValues = options.map((o) => o.element.value)
    for (const cat of categoryOrder) {
      expect(optionValues).toContain(cat.key)
    }
    wrapper.unmount()
  })

  it('all 9 category labels are visible', () => {
    const wrapper = mountForm(null)
    for (const cat of categoryOrder) {
      expect(wrapper.text()).toContain(cat.label)
    }
    wrapper.unmount()
  })
})
