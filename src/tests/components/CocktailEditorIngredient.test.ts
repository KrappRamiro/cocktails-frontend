import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CocktailEditorIngredient from '@/components/CocktailEditorIngredient.vue'
import { makeIngredient } from '@/tests/fixtures'
import type { CocktailIngredientPayload } from '@/types'

const ingredients = [
  makeIngredient({ id: '1', name: 'Gin (seco/dry)', category: 'bases_alcoholicas' }),
  makeIngredient({ id: '2', name: 'Vodka (neutro)', category: 'bases_alcoholicas' }),
  makeIngredient({ id: '3', name: 'Tónica', category: 'mixers_gaseosas' }),
]

function mountRow(value: Partial<CocktailIngredientPayload> = {}) {
  return mount(CocktailEditorIngredient, {
    props: {
      modelValue: {
        ingredient_id: '1',
        amount: '50ml',
        note: null,
        ...value,
      },
      ingredientOptions: ingredients,
    },
  })
}

describe('CocktailEditorIngredient', () => {
  it('groups ingredients into optgroup elements', () => {
    const wrapper = mountRow()
    const optgroups = wrapper.findAll('optgroup')
    expect(optgroups.length).toBeGreaterThan(0)
  })

  it('only renders optgroups for categories with items', () => {
    const wrapper = mountRow()
    const optgroups = wrapper.findAll('optgroup')
    // We have bases_alcoholicas and mixers_gaseosas, not all 9
    expect(optgroups.length).toBe(2)
  })

  it('emits update:modelValue when ingredient selected', async () => {
    const wrapper = mountRow({ ingredient_id: '' })
    const select = wrapper.find('select')
    await select.setValue('2')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue')![0][0] as CocktailIngredientPayload
    expect(emitted.ingredient_id).toBe('2')
  })

  it('emits update:modelValue when amount changed', async () => {
    const wrapper = mountRow()
    const input = wrapper.find('input[placeholder="50ml"]')
    await input.setValue('25ml')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue')![0][0] as CocktailIngredientPayload
    expect(emitted.amount).toBe('25ml')
  })

  it('emits update:modelValue with note=null when note cleared', async () => {
    const wrapper = mountRow({ note: 'algo' })
    const noteInput = wrapper.find('input[placeholder="opcional"]')
    await noteInput.setValue('')
    const emitted = wrapper.emitted('update:modelValue')!
    const last = emitted[emitted.length - 1][0] as CocktailIngredientPayload
    expect(last.note).toBeNull()
  })

  it('emits remove when remove button clicked', async () => {
    const wrapper = mountRow()
    const removeBtn = wrapper.find('button[aria-label="Eliminar ingrediente de la receta"]')
    await removeBtn.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })
})
