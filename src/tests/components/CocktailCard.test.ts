/**
 * Tests for CocktailCard component.
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CocktailCard from '@/components/CocktailCard.vue'
import { makeCocktail, makeCocktailIngredient } from '@/tests/fixtures'
import { baseColorClasses, baseLabel } from '@/utils/cocktailColors'
import type { CocktailWithAvailability } from '@/types'

// ─── Helper ───────────────────────────────────────────────────────────────────

function mountCard(overrides: Partial<CocktailWithAvailability> = {}) {
  return mount(CocktailCard, {
    props: { cocktail: makeCocktail(overrides) },
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CocktailCard', () => {

  // ── Collapsed state ──────────────────────────────────────────────────

  it('is initially collapsed', () => {
    const wrapper = mountCard()
    const toggle = wrapper.find('[aria-expanded]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('expanded content is not visible when collapsed', () => {
    const wrapper = mountCard()
    // The expandable section uses v-if=isOpen
    expect(wrapper.find('.border-t.border-slate-100').exists()).toBe(false)
    wrapper.unmount()
  })

  // ── Toggle open ───────────────────────────────────────────────────────

  it('click toggles open: aria-expanded becomes true', async () => {
    const wrapper = mountCard()
    const toggle = wrapper.find('[aria-expanded]')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    wrapper.unmount()
  })

  it('click again collapses: aria-expanded goes back to false', async () => {
    const wrapper = mountCard()
    const toggle = wrapper.find('[aria-expanded]')
    await toggle.trigger('click')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  // ── Header content ────────────────────────────────────────────────────

  it('displays cocktail name in header', () => {
    const wrapper = mountCard({ name: 'Gin Fizz' })
    expect(wrapper.text()).toContain('Gin Fizz')
    wrapper.unmount()
  })

  it('shows base badge with correct color classes', () => {
    const wrapper = mountCard({ base: 'gin' })
    const badge = wrapper.find(`span.${baseColorClasses.gin.split(' ').join('.')}`)
    expect(badge.exists()).toBe(true)
    wrapper.unmount()
  })

  it('shows base badge with correct label text', () => {
    const wrapper = mountCard({ base: 'vodka' })
    expect(wrapper.text()).toContain(baseLabel.vodka)
    wrapper.unmount()
  })

  it('"Adaptado" badge is shown when is_adapted=true', () => {
    const wrapper = mountCard({ is_adapted: true, adaptation_note: 'Sin vermut' })
    expect(wrapper.text()).toContain('Adaptado')
    wrapper.unmount()
  })

  it('"Adaptado" badge is NOT shown when is_adapted=false', () => {
    const wrapper = mountCard({ is_adapted: false })
    expect(wrapper.text()).not.toContain('Adaptado')
    wrapper.unmount()
  })

  // ── Expanded content ──────────────────────────────────────────────────

  describe('when expanded', () => {
    async function openCard(overrides: Partial<CocktailWithAvailability> = {}) {
      const wrapper = mountCard(overrides)
      await wrapper.find('[aria-expanded]').trigger('click')
      return wrapper
    }

    it('ingredients are listed with "amount — name" format', async () => {
      const wrapper = await openCard({
        ingredients: [
          makeCocktailIngredient({ ingredient_id: 'i1', name: 'Gin', amount: '50ml', note: null }),
          makeCocktailIngredient({ ingredient_id: 'i2', name: 'Tónica', amount: '100ml', note: null }),
        ],
      })
      expect(wrapper.text()).toContain('50ml')
      expect(wrapper.text()).toContain('Gin')
      expect(wrapper.text()).toContain('100ml')
      expect(wrapper.text()).toContain('Tónica')
      wrapper.unmount()
    })

    it('ingredient note is shown in parentheses when non-null', async () => {
      const wrapper = await openCard({
        ingredients: [
          makeCocktailIngredient({ ingredient_id: 'i1', name: 'Gin', amount: '50ml', note: 'bien frío' }),
        ],
      })
      expect(wrapper.text()).toContain('(bien frío)')
      wrapper.unmount()
    })

    it('ingredient note is NOT shown when null', async () => {
      const wrapper = await openCard({
        ingredients: [
          makeCocktailIngredient({ ingredient_id: 'i1', name: 'Gin', amount: '50ml', note: null }),
        ],
      })
      // No parentheses around null note
      const lis = wrapper.findAll('li')
      const ginLi = lis.find((li) => li.text().includes('Gin'))
      expect(ginLi?.text()).not.toContain('(')
      wrapper.unmount()
    })

    it('steps are rendered as an ordered list', async () => {
      const wrapper = await openCard({
        steps: ['Mezclar con hielo.', 'Servir en copa fría.'],
      })
      const ol = wrapper.find('ol')
      expect(ol.exists()).toBe(true)
      const items = ol.findAll('li')
      expect(items).toHaveLength(2)
      expect(items[0].text()).toContain('Mezclar con hielo.')
      expect(items[1].text()).toContain('Servir en copa fría.')
      wrapper.unmount()
    })

    it('garnish is shown when present', async () => {
      const wrapper = await openCard({ garnish: 'Rodaja de naranja' })
      expect(wrapper.text()).toContain('Rodaja de naranja')
      wrapper.unmount()
    })

    it('garnish section is not shown when empty', async () => {
      const wrapper = await openCard({ garnish: '' })
      // The garnish div uses v-if="cocktail.garnish" so it won't render
      expect(wrapper.text()).not.toContain('Decoración:')
      wrapper.unmount()
    })

    it('adaptation note is shown when is_adapted=true and note is set', async () => {
      const wrapper = await openCard({ is_adapted: true, adaptation_note: 'Sin vermut, más dulce' })
      expect(wrapper.text()).toContain('Sin vermut, más dulce')
      wrapper.unmount()
    })

    it('adaptation note section is not shown when is_adapted=false', async () => {
      const wrapper = await openCard({ is_adapted: false, adaptation_note: null })
      // The adaptation note div requires both is_adapted and adaptation_note
      const orangeDiv = wrapper.find('.bg-orange-50')
      expect(orangeDiv.exists()).toBe(false)
      wrapper.unmount()
    })
  })

  // ── Keyboard interaction ──────────────────────────────────────────────

  it('Enter keydown toggles expansion', async () => {
    const wrapper = mountCard()
    const toggle = wrapper.find('[aria-expanded]')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('keydown.enter')
    expect(toggle.attributes('aria-expanded')).toBe('true')

    await toggle.trigger('keydown.enter')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('Space keydown toggles expansion', async () => {
    const wrapper = mountCard()
    const toggle = wrapper.find('[aria-expanded]')
    expect(toggle.attributes('aria-expanded')).toBe('false')

    await toggle.trigger('keydown.space')
    expect(toggle.attributes('aria-expanded')).toBe('true')

    await toggle.trigger('keydown.space')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })
})
