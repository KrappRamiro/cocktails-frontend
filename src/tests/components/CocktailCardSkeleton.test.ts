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

  it('contains three placeholder divs', () => {
    const wrapper = mount(CocktailCardSkeleton)
    const placeholders = wrapper.findAll('.bg-slate-200')
    expect(placeholders).toHaveLength(3)
  })
})
