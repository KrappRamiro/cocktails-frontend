import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

describe('NotFound', () => {
  it('renders 404 text', () => {
    const wrapper = mount(NotFound, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('404')
  })

  it('renders "Página no encontrada"', () => {
    const wrapper = mount(NotFound, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Página no encontrada')
  })

  it('has a link pointing to /', () => {
    const wrapper = mount(NotFound, { global: { plugins: [router] } })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/')
  })
})
