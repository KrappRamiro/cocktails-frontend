import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CocktailCardSkeleton from '@/components/CocktailCardSkeleton.vue'

describe('CocktailCardSkeleton', () => {
  it('renders without errors', () => {
    const wrapper = mount(CocktailCardSkeleton)
    expect(wrapper.exists()).toBe(true)
  })

  it('has the animate-pulse class', () => {
    const wrapper = mount(CocktailCardSkeleton)
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('contains placeholder bars', () => {
    const wrapper = mount(CocktailCardSkeleton)
    // The skeleton uses bg-elevated / bg-elevated/70 for placeholder bars
    const placeholders = wrapper.findAll('[class*="bg-elevated"]')
    expect(placeholders.length).toBeGreaterThan(0)
  })
})
