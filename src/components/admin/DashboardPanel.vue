<template>
  <div class="space-y-8">
    <!-- Total hero -->
    <section class="text-center py-4">
      <p class="small-caps text-[0.7rem] text-accent/80 mb-2">Disponibilidad total</p>
      <p class="font-display leading-none text-fg" style="font-size: clamp(3rem, 10vw, 5rem)">
        {{ stats.available }}
        <span class="text-muted">/</span>
        <span class="text-muted/80">{{ stats.total }}</span>
      </p>
      <p class="small-caps text-[0.65rem] text-muted mt-2">
        tragos servibles con ingredientes actuales
      </p>

      <div class="flex items-center justify-center gap-3 mt-4 text-accent/70">
        <span class="h-px w-20 bg-gradient-to-r from-transparent to-accent/60" />
        <span class="text-[0.55rem] small-caps">✦</span>
        <span class="h-px w-20 bg-gradient-to-l from-transparent to-accent/60" />
      </div>
    </section>

    <!-- By base -->
    <section>
      <h3 class="small-caps text-xs text-accent/80 mb-3">Por base</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="stat in byBase"
          :key="stat.base"
          class="bg-surface border border-border-app/70 rounded-deco px-3 py-3"
        >
          <p class="small-caps text-[0.6rem] text-muted">{{ stat.label }}</p>
          <p class="font-display text-xl text-fg mt-0.5">
            {{ stat.available }}
            <span class="text-muted text-base">/ {{ stat.total }}</span>
          </p>
          <div class="mt-2 h-[3px] bg-elevated rounded-full overflow-hidden">
            <div
              class="h-full bg-accent/80"
              :style="{ width: stat.total > 0 ? (stat.available / stat.total * 100) + '%' : '0%' }"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Almost there -->
    <section v-if="almostThere.length > 0">
      <h3 class="small-caps text-xs text-accent/80 mb-3">A un ingrediente de servir</h3>
      <ul class="space-y-2">
        <li
          v-for="entry in almostThere"
          :key="entry.cocktailId"
          class="bg-surface border border-border-app/60 rounded-deco px-4 py-3 flex items-center justify-between gap-3"
        >
          <span class="text-sm text-fg truncate">{{ entry.cocktailName }}</span>
          <button
            type="button"
            class="small-caps text-[0.65rem] border border-accent/50 text-accent rounded-full px-3 py-1 hover:bg-accent/10 transition-colors"
            @click="$emit('activateIngredient', entry.missingIngredientId)"
          >
            activar {{ entry.missingIngredientName }}
          </button>
        </li>
      </ul>
    </section>

    <!-- Unlock impact -->
    <section v-if="unlockImpact.length > 0">
      <h3 class="small-caps text-xs text-accent/80 mb-3">Activar desbloquearía</h3>
      <ul class="space-y-2">
        <li
          v-for="entry in unlockImpact"
          :key="entry.ingredientId"
          class="bg-surface border border-border-app/60 rounded-deco px-4 py-3 flex items-center justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="text-sm text-fg truncate">{{ entry.ingredientName }}</p>
            <p class="small-caps text-[0.6rem] text-muted mt-0.5">desbloquea {{ entry.count }} recetas</p>
          </div>
          <button
            type="button"
            class="small-caps text-[0.65rem] border border-accent/50 text-accent rounded-full px-3 py-1 hover:bg-accent/10 transition-colors"
            @click="$emit('activateIngredient', entry.ingredientId)"
          >
            activar
          </button>
        </li>
      </ul>
    </section>

    <!-- Public menu link -->
    <div class="text-center pt-2">
      <a
        href="/"
        target="_blank"
        class="inline-flex items-center gap-2 small-caps text-xs text-accent hover:text-accent-hover transition-colors"
      >
        Ver menú público
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 17l10-10" />
          <path d="M7 7h10v10" />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CocktailWithAvailability, Ingredient, Stats } from '@/types'

const props = defineProps<{
  cocktails: CocktailWithAvailability[]
  ingredients: Ingredient[]
  stats: Stats
  byBase: { base: string; label: string; available: number; total: number }[]
}>()

defineEmits<{ activateIngredient: [ingredientId: string] }>()

// Compute per-cocktail missing-set (only required, unavailable ingredients)
const cocktailMissing = computed(() => {
  const availableIds = new Set(
    props.ingredients.filter((i) => i.is_available).map((i) => i.id),
  )
  const map = new Map<string, Set<string>>()
  for (const c of props.cocktails) {
    const missing = new Set<string>()
    for (const reqId of c.required_ingredients) {
      if (!availableIds.has(reqId)) missing.add(reqId)
    }
    map.set(c.id, missing)
  }
  return map
})

const ingredientsById = computed(() => {
  const m: Record<string, Ingredient> = {}
  for (const i of props.ingredients) m[i.id] = i
  return m
})

// Cocktails missing exactly one ingredient
const almostThere = computed(() => {
  const results: {
    cocktailId: string
    cocktailName: string
    missingIngredientId: string
    missingIngredientName: string
  }[] = []

  for (const c of props.cocktails) {
    const missing = cocktailMissing.value.get(c.id)
    if (!missing || missing.size !== 1) continue
    const missingId = [...missing][0]
    const ing = ingredientsById.value[missingId]
    if (!ing) continue
    results.push({
      cocktailId: c.id,
      cocktailName: c.name,
      missingIngredientId: missingId,
      missingIngredientName: ing.name,
    })
  }

  return results.slice(0, 8)
})

// For each unavailable ingredient, count cocktails it would unlock (those missing only it)
const unlockImpact = computed(() => {
  const counts = new Map<string, number>()

  for (const [, missing] of cocktailMissing.value) {
    if (missing.size === 1) {
      const only = [...missing][0]
      counts.set(only, (counts.get(only) ?? 0) + 1)
    }
  }

  const results = [...counts.entries()]
    .map(([ingredientId, count]) => ({
      ingredientId,
      ingredientName: ingredientsById.value[ingredientId]?.name ?? '(desconocido)',
      count,
    }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)

  return results.slice(0, 5)
})
</script>
