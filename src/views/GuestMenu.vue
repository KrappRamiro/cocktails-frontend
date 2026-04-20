<template>
  <div class="min-h-screen pb-16 bg-base text-fg">
    <GuestHeader :event-name="configStore.eventName" :stats="stats" :loading="loading" />

    <!-- Filtros + Buscador -->
    <div class="sticky top-0 z-10 bg-base/85 backdrop-blur-sm border-b border-border-app/50">
      <div class="mx-auto max-w-5xl px-4 py-3 space-y-3">
        <label class="block relative">
          <span class="sr-only">Buscar trago</span>
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            v-model="searchQuery"
            data-testid="guest-search"
            type="search"
            placeholder="Buscar trago..."
            class="w-full rounded-full border-border-app/70 bg-surface text-sm pl-9 pr-3 py-2.5 focus:border-accent"
          />
        </label>
        <FilterBar
          :base="selectedBase"
          :taste="selectedTaste"
          @update:base="selectedBase = $event"
          @update:taste="selectedTaste = $event"
        />
      </div>
    </div>

    <!-- Contenido -->
    <main class="mx-auto max-w-5xl px-4 mt-6">
      <div
        v-if="loading"
        data-testid="loading-skeletons"
        class="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <CocktailCardSkeleton v-for="n in 6" :key="n" />
      </div>

      <div
        v-else-if="filteredCocktails.length === 0 && stats.available === 0"
        data-testid="empty-menu"
        class="text-center py-24 text-muted"
      >
        <p class="font-display text-2xl text-fg/80 mb-2">El menú se publicará pronto.</p>
        <p class="small-caps text-[0.7rem] text-muted">vuelve más tarde</p>
      </div>

      <div
        v-else-if="filteredCocktails.length === 0"
        data-testid="no-results"
        class="text-center py-24 text-muted"
      >
        <p class="font-display text-2xl text-fg/80 mb-2">Nada coincide con tu búsqueda.</p>
        <p class="small-caps text-[0.7rem] text-muted">probá otros filtros</p>
      </div>

      <div
        v-else
        data-testid="cocktails-grid"
        :class="[
          'grid gap-4',
          modo === 'barra'
            ? 'grid-cols-1 xl:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        ]"
      >
        <template v-for="cocktail in filteredCocktails" :key="cocktail.id">
          <GuestCardFull v-if="modo === 'barra'" :cocktail="cocktail" />
          <GuestCardCompact v-else :cocktail="cocktail" />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCocktails } from '@/composables/useCocktails'
import { useModoBarra } from '@/composables/useModoBarra'
import { useTheme } from '@/composables/useTheme'
import { useConfigStore } from '@/stores/configStore'
import { matchesSearch } from '@/utils/normalize'
import FilterBar from '@/components/FilterBar.vue'
import GuestHeader from '@/components/guest/GuestHeader.vue'
import GuestCardCompact from '@/components/guest/GuestCardCompact.vue'
import GuestCardFull from '@/components/guest/GuestCardFull.vue'
import CocktailCardSkeleton from '@/components/CocktailCardSkeleton.vue'

// Activate URL syncing for theme + modo
useTheme()
const { modo } = useModoBarra()

const configStore = useConfigStore()
const { cocktails, stats, loading, selectedBase, selectedTaste, searchQuery } = useCocktails()

onMounted(() => {
  configStore.loadConfig()
})

const filteredCocktails = computed(() => {
  const q = searchQuery.value
  if (!q) return cocktails.value
  return cocktails.value.filter((c) => matchesSearch(c.name, q))
})
</script>
