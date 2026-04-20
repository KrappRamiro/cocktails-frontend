<template>
  <article
    data-testid="cocktail-card"
    data-view="compact"
    class="group relative bg-surface border border-border-app/80 rounded-deco rounded-br-[12px] px-5 py-5 shadow-deco-sm hover:shadow-deco transition-shadow"
  >
    <!-- Deco bracket (top-left) -->
    <span
      aria-hidden
      class="pointer-events-none absolute -top-px -left-px h-3 w-3 border-l border-t border-accent/70 rounded-tl-[2px]"
    />
    <span
      aria-hidden
      class="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-r border-b border-accent/70 rounded-br-[12px]"
    />

    <div class="flex items-start gap-4">
      <!-- Glass icon -->
      <div class="shrink-0 text-accent/80 pt-0.5">
        <GlassIcon :glass="cocktail.glass" :size="44" />
      </div>

      <div class="flex-1 min-w-0">
        <!-- Title row -->
        <div class="flex items-start justify-between gap-3 mb-1">
          <h2 class="font-display text-[1.4rem] leading-[1.15] text-fg">
            {{ cocktail.name }}
          </h2>
          <span
            v-if="cocktail.is_adapted"
            class="shrink-0 text-[0.6rem] small-caps text-accent/80 border border-accent/40 rounded-sm px-1.5 py-0.5"
            :title="cocktail.adaptation_note ?? ''"
          >
            adaptada
          </span>
        </div>

        <!-- Base + tastes -->
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
          <BaseBadge :base="cocktail.base" />
          <TasteTags :tastes="cocktail.taste" />
        </div>

        <!-- Description -->
        <p class="text-sm text-muted font-sans leading-relaxed italic">
          {{ cocktail.description }}
        </p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CocktailWithAvailability } from '@/types'
import BaseBadge from './BaseBadge.vue'
import TasteTags from './TasteTags.vue'
import GlassIcon from '@/components/glasses/GlassIcon.vue'

defineProps<{ cocktail: CocktailWithAvailability }>()
</script>
