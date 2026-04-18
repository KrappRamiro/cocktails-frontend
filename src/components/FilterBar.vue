<template>
  <div class="space-y-2">
    <!-- Tabs por base -->
    <div data-testid="filter-base" role="tablist" aria-label="Filtrar por base" class="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="tab in baseTabs"
        :key="tab.value ?? 'all'"
        role="tab"
        :aria-selected="base === tab.value"
        :class="[
          'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]',
          base === tab.value
            ? 'bg-slate-800 text-white'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100',
        ]"
        @click="$emit('update:base', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tabs por gusto -->
    <div data-testid="filter-taste" role="tablist" aria-label="Filtrar por gusto" class="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="tab in tasteTabs"
        :key="tab.value ?? 'all'"
        role="tab"
        :aria-selected="taste === tab.value"
        :class="[
          'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]',
          taste === tab.value
            ? 'bg-slate-700 text-white'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100',
        ]"
        @click="$emit('update:taste', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CocktailBase, CocktailTaste } from '@/types'
import { baseLabel, tasteLabel } from '@/utils/cocktailColors'

defineProps<{
  base: CocktailBase | null
  taste: CocktailTaste | null
}>()

defineEmits<{
  'update:base': [value: CocktailBase | null]
  'update:taste': [value: CocktailTaste | null]
}>()

const baseTabs: { value: CocktailBase | null; label: string }[] = [
  { value: null, label: 'Todos' },
  ...Object.entries(baseLabel).map(([key, label]) => ({
    value: key as CocktailBase,
    label,
  })),
]

const tasteTabs: { value: CocktailTaste | null; label: string }[] = [
  { value: null, label: 'Todos' },
  ...Object.entries(tasteLabel).map(([key, label]) => ({
    value: key as CocktailTaste,
    label,
  })),
]
</script>
