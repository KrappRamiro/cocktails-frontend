<template>
  <div class="min-h-screen pb-8">
    <!-- Header -->
    <header data-testid="guest-header" class="bg-slate-800 text-white px-4 py-6 text-center">
      <h1 class="text-2xl font-bold">{{ eventName }}</h1>
      <p v-if="!loading" data-testid="available-count" class="mt-1 text-slate-300 text-sm">
        {{ stats.available }} tragos disponibles esta noche
      </p>
      <div v-else class="mt-1 h-4 w-48 mx-auto bg-slate-600 rounded animate-pulse"></div>
    </header>

    <!-- Filtros + Buscador -->
    <div class="px-4 py-3 sticky top-0 bg-slate-50 z-10 space-y-2">
      <input
        v-model="searchQuery"
        data-testid="guest-search"
        type="text"
        placeholder="Buscar trago..."
        class="w-full rounded-lg border-slate-300 text-sm px-3 py-2"
      />
      <FilterBar
        :base="selectedBase"
        :taste="selectedTaste"
        @update:base="selectedBase = $event"
        @update:taste="selectedTaste = $event"
      />
    </div>

    <!-- Contenido -->
    <main class="px-4 mt-2">
      <!-- Loading -->
      <div v-if="loading" data-testid="loading-skeletons" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <CocktailCardSkeleton v-for="n in 6" :key="n" />
      </div>

      <!-- Sin resultados -->
      <div v-else-if="filteredCocktails.length === 0 && stats.available === 0" data-testid="empty-menu" class="text-center py-16 text-slate-400">
        <p class="text-lg">El menú se publicará pronto.</p>
      </div>

      <div v-else-if="filteredCocktails.length === 0" data-testid="no-results" class="text-center py-16 text-slate-400">
        <p class="text-lg">No hay tragos disponibles con estos filtros</p>
      </div>

      <!-- Grid de cocktails -->
      <div v-else data-testid="cocktails-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <CocktailCard
          v-for="cocktail in filteredCocktails"
          :key="cocktail.id"
          :cocktail="cocktail"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCocktails } from '@/composables/useCocktails'
import FilterBar from '@/components/FilterBar.vue'
import CocktailCard from '@/components/CocktailCard.vue'
import CocktailCardSkeleton from '@/components/CocktailCardSkeleton.vue'

const eventName = import.meta.env.VITE_EVENT_NAME || 'Evento'
const searchQuery = ref('')

const { cocktails, stats, loading, selectedBase, selectedTaste } = useCocktails()

const filteredCocktails = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return cocktails.value
  return cocktails.value.filter((c) =>
    c.name.toLowerCase().includes(q)
  )
})
</script>
