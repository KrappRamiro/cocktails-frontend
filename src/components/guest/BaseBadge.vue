<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border border-accent/45 bg-accent/10 px-2.5 py-0.5 text-[0.65rem] small-caps font-medium text-accent"
  >
    <span class="h-1 w-1 rounded-full bg-accent" />
    {{ baseLabel[base] }}
  </span>
</template>

<script setup lang="ts">
import type { CocktailBase } from '@/types'
import { baseLabel } from '@/utils/cocktailColors'

defineProps<{ base: CocktailBase }>()
</script>
