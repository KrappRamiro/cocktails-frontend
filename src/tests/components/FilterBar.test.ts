/**
 * Tests for FilterBar component.
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterBar from '@/components/FilterBar.vue'
import { baseLabel, tasteLabel } from '@/utils/cocktailColors'
import type { CocktailBase, CocktailTaste } from '@/types'

// ─── Helper ───────────────────────────────────────────────────────────────────

function mountBar(props: { base?: CocktailBase | null; taste?: CocktailTaste | null } = {}) {
  return mount(FilterBar, {
    props: {
      base: props.base ?? null,
      taste: props.taste ?? null,
    },
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FilterBar', () => {

  // ── Tab counts ───────────────────────────────────────────────────────

  it('renders 9 base tabs (8 bases + Todos)', () => {
    const wrapper = mountBar()
    // First tablist: base tabs
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    const tabs = baseTablist.findAll('[role="tab"]')
    // 8 bases + 1 Todos
    expect(tabs).toHaveLength(Object.keys(baseLabel).length + 1)
    wrapper.unmount()
  })

  it('renders 7 taste tabs (6 tastes + Todos)', () => {
    const wrapper = mountBar()
    const [, tasteTablist] = wrapper.findAll('[role="tablist"]')
    const tabs = tasteTablist.findAll('[role="tab"]')
    // 6 tastes + 1 Todos
    expect(tabs).toHaveLength(Object.keys(tasteLabel).length + 1)
    wrapper.unmount()
  })

  it('first tab in base list is "Todos"', () => {
    const wrapper = mountBar()
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    const firstTab = baseTablist.findAll('[role="tab"]')[0]
    expect(firstTab.text()).toBe('Todos')
    wrapper.unmount()
  })

  it('first tab in taste list is "Todos"', () => {
    const wrapper = mountBar()
    const [, tasteTablist] = wrapper.findAll('[role="tablist"]')
    const firstTab = tasteTablist.findAll('[role="tab"]')[0]
    expect(firstTab.text()).toBe('Todos')
    wrapper.unmount()
  })

  // ── aria-selected ────────────────────────────────────────────────────

  it('tab matching base prop has aria-selected=true', () => {
    const wrapper = mountBar({ base: 'gin' })
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    const ginTab = baseTablist.findAll('[role="tab"]').find((t) => t.text() === baseLabel.gin)
    expect(ginTab?.attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  it('non-matching base tabs have aria-selected=false', () => {
    const wrapper = mountBar({ base: 'gin' })
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    const vodkaTab = baseTablist.findAll('[role="tab"]').find((t) => t.text() === baseLabel.vodka)
    expect(vodkaTab?.attributes('aria-selected')).toBe('false')
    wrapper.unmount()
  })

  it('base Todos tab has aria-selected=true when base=null', () => {
    const wrapper = mountBar({ base: null })
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    const todosTab = baseTablist.findAll('[role="tab"]')[0]
    expect(todosTab.attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  it('tab matching taste prop has aria-selected=true', () => {
    const wrapper = mountBar({ taste: 'fresco' })
    const [, tasteTablist] = wrapper.findAll('[role="tablist"]')
    const frescoTab = tasteTablist.findAll('[role="tab"]').find((t) => t.text() === tasteLabel.fresco)
    expect(frescoTab?.attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  it('taste Todos tab has aria-selected=true when taste=null', () => {
    const wrapper = mountBar({ taste: null })
    const [, tasteTablist] = wrapper.findAll('[role="tablist"]')
    const todosTab = tasteTablist.findAll('[role="tab"]')[0]
    expect(todosTab.attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  // ── Emit update:base ─────────────────────────────────────────────────

  it('clicking a base tab emits update:base with that value', async () => {
    const wrapper = mountBar({ base: null })
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    const ginTab = baseTablist.findAll('[role="tab"]').find((t) => t.text() === baseLabel.gin)!
    await ginTab.trigger('click')
    expect(wrapper.emitted('update:base')).toBeTruthy()
    expect(wrapper.emitted('update:base')![0][0]).toBe('gin')
    wrapper.unmount()
  })

  it('clicking base Todos tab emits update:base with null', async () => {
    const wrapper = mountBar({ base: 'gin' })
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    const todosTab = baseTablist.findAll('[role="tab"]')[0]
    await todosTab.trigger('click')
    expect(wrapper.emitted('update:base')![0][0]).toBeNull()
    wrapper.unmount()
  })

  // ── Emit update:taste ────────────────────────────────────────────────

  it('clicking a taste tab emits update:taste with that value', async () => {
    const wrapper = mountBar({ taste: null })
    const [, tasteTablist] = wrapper.findAll('[role="tablist"]')
    const frescoTab = tasteTablist.findAll('[role="tab"]').find((t) => t.text() === tasteLabel.fresco)!
    await frescoTab.trigger('click')
    expect(wrapper.emitted('update:taste')).toBeTruthy()
    expect(wrapper.emitted('update:taste')![0][0]).toBe('fresco')
    wrapper.unmount()
  })

  it('clicking taste Todos tab emits update:taste with null', async () => {
    const wrapper = mountBar({ taste: 'amargo' })
    const [, tasteTablist] = wrapper.findAll('[role="tablist"]')
    const todosTab = tasteTablist.findAll('[role="tab"]')[0]
    await todosTab.trigger('click')
    expect(wrapper.emitted('update:taste')![0][0]).toBeNull()
    wrapper.unmount()
  })

  // ── Accessibility ────────────────────────────────────────────────────

  it('role=tablist is present (both base and taste)', () => {
    const wrapper = mountBar()
    const tablists = wrapper.findAll('[role="tablist"]')
    expect(tablists).toHaveLength(2)
    wrapper.unmount()
  })

  it('base tablist has aria-label for base', () => {
    const wrapper = mountBar()
    const [baseTablist] = wrapper.findAll('[role="tablist"]')
    expect(baseTablist.attributes('aria-label')).toBeTruthy()
    wrapper.unmount()
  })

  it('taste tablist has aria-label for taste', () => {
    const wrapper = mountBar()
    const [, tasteTablist] = wrapper.findAll('[role="tablist"]')
    expect(tasteTablist.attributes('aria-label')).toBeTruthy()
    wrapper.unmount()
  })
})
