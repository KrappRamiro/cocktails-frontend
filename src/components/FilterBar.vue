<template>
  <div class="space-y-2">
    <!-- Filtros por base -->
    <div class="relative bg-fade-x">
      <div
        data-testid="filter-base"
        role="tablist"
        aria-label="Filtrar por base"
        class="flex gap-2 overflow-x-auto scrollbar-hidden px-1 pb-1"
      >
        <FilterChip
          v-for="tab in baseTabs"
          :key="tab.value ?? 'all'"
          :active="base === tab.value"
          @select="$emit('update:base', tab.value)"
        >
          {{ tab.label }}
        </FilterChip>
      </div>
    </div>

    <!-- Filtros por gusto -->
    <div class="relative bg-fade-x">
      <div
        data-testid="filter-taste"
        role="tablist"
        aria-label="Filtrar por gusto"
        class="flex gap-2 overflow-x-auto scrollbar-hidden px-1 pb-1"
      >
        <FilterChip
          v-for="tab in tasteTabs"
          :key="tab.value ?? 'all'"
          :active="taste === tab.value"
          @select="$emit('update:taste', tab.value)"
        >
          {{ tab.label }}
        </FilterChip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CocktailBase, CocktailTaste } from '@/types'
import { baseLabel, tasteLabel } from '@/utils/cocktailColors'
import FilterChip from '@/components/filters/FilterChip.vue'

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
