<template>
  <div v-if="tastes.length" class="flex flex-wrap gap-1">
    <span
      v-for="t in tastes"
      :key="t"
      class="text-[0.65rem] small-caps text-muted"
    >
      · {{ tasteLabel[t] }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { CocktailTaste } from '@/types'
import { tasteLabel } from '@/utils/cocktailColors'

defineProps<{ tastes: CocktailTaste[] }>()
</script>
