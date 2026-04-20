<template>
  <article
    data-testid="cocktail-card"
    data-view="full"
    class="group relative bg-surface border border-border-app/80 rounded-deco rounded-br-[12px] shadow-deco-sm"
  >
    <!-- Deco brackets -->
    <span
      aria-hidden
      class="pointer-events-none absolute -top-px -left-px h-3 w-3 border-l border-t border-accent/70 rounded-tl-[2px]"
    />
    <span
      aria-hidden
      class="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-r border-b border-accent/70 rounded-br-[12px]"
    />

    <!-- Header -->
    <div class="px-5 pt-5 pb-4 flex items-start gap-4">
      <div class="shrink-0 text-accent/80 pt-0.5">
        <GlassIcon :glass="cocktail.glass" :size="44" />
      </div>

      <div class="flex-1 min-w-0">
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

        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          <BaseBadge :base="cocktail.base" />
          <TasteTags :tastes="cocktail.taste" />
          <span class="text-[0.65rem] small-caps text-muted">
            · {{ glassLabel[cocktail.glass] }}
          </span>
        </div>

        <p class="text-sm text-muted font-sans leading-relaxed italic">
          {{ cocktail.description }}
        </p>
      </div>
    </div>

    <!-- Rule -->
    <div class="deco-rule px-5 text-[0.6rem] small-caps">receta</div>

    <!-- Body -->
    <div class="px-5 pt-3 pb-5 grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-x-6 gap-y-4">
      <!-- Ingredients -->
      <section>
        <h3 class="small-caps text-[0.65rem] text-accent/80 mb-2">
          Ingredientes
        </h3>
        <ul class="space-y-1">
          <li
            v-for="ing in cocktail.ingredients"
            :key="ing.ingredient_id"
            class="text-sm text-fg leading-snug"
          >
            <span class="font-semibold tracking-wide">{{ ing.amount }}</span>
            <span class="text-muted mx-1.5">—</span>
            {{ ing.name }}
            <span v-if="ing.note" class="text-muted text-xs"> ({{ ing.note }})</span>
          </li>
        </ul>
      </section>

      <!-- Steps -->
      <section>
        <h3 class="small-caps text-[0.65rem] text-accent/80 mb-2">
          Preparación
        </h3>
        <ol class="space-y-2">
          <li
            v-for="(step, i) in cocktail.steps"
            :key="i"
            class="text-sm text-fg leading-snug flex gap-2"
          >
            <span
              class="font-display text-accent/80 shrink-0 leading-none pt-[1px]"
              style="font-variant-numeric: oldstyle-nums"
            >
              {{ i + 1 }}.
            </span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </section>

      <!-- Garnish -->
      <div v-if="cocktail.garnish" class="sm:col-span-2 text-sm text-fg/85">
        <span class="small-caps text-[0.65rem] text-accent/80">Decoración: </span>
        {{ cocktail.garnish }}
      </div>

      <!-- Adaptation note -->
      <div
        v-if="cocktail.is_adapted && cocktail.adaptation_note"
        class="sm:col-span-2 text-xs italic text-muted border-l border-accent/40 pl-3"
      >
        {{ cocktail.adaptation_note }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CocktailWithAvailability } from '@/types'
import { glassLabel } from '@/utils/cocktailColors'
import BaseBadge from './BaseBadge.vue'
import TasteTags from './TasteTags.vue'
import GlassIcon from '@/components/glasses/GlassIcon.vue'

defineProps<{ cocktail: CocktailWithAvailability }>()
</script>
