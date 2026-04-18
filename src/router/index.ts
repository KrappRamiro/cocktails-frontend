/**
 * Vue Router config.
 *
 * - / → GuestMenu (pública)
 * - /admin → AdminPanel (sin guard — el componente maneja login internamente)
 * - catch-all → NotFound
 */

import { createRouter, createWebHistory } from 'vue-router'
import GuestMenu from '@/views/GuestMenu.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'guest',
      component: GuestMenu,
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminPanel.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

export default router
