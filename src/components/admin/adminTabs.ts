import type { Component } from 'vue'
import IconDrop from './icons/IconDrop.vue'
import IconBook from './icons/IconBook.vue'
import IconGauge from './icons/IconGauge.vue'
import IconGear from './icons/IconGear.vue'

export type AdminTabKey = 'ingredients' | 'recipes' | 'dashboard' | 'settings'

export interface AdminTab {
  key: AdminTabKey
  label: string
  icon: Component
  testId: string
}

export const adminTabs: readonly AdminTab[] = [
  { key: 'ingredients', label: 'Ingredientes', icon: IconDrop, testId: 'tab-ingredients' },
  { key: 'recipes', label: 'Recetas', icon: IconBook, testId: 'tab-recipes' },
  { key: 'dashboard', label: 'La Barra', icon: IconGauge, testId: 'tab-dashboard' },
  { key: 'settings', label: 'Ajustes', icon: IconGear, testId: 'tab-settings' },
] as const
