<template>
  <div data-testid="cocktail-card" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <!-- Header (siempre visible, clickeable) -->
    <button
      data-testid="cocktail-card-header"
      class="w-full text-left px-4 py-3 flex items-center gap-3 min-h-[52px] hover:bg-slate-50 transition-colors"
      role="button"
      :aria-expanded="isOpen"
      tabindex="0"
      @click="isOpen = !isOpen"
      @keydown.enter.prevent="isOpen = !isOpen"
      @keydown.space.prevent="isOpen = !isOpen"
    >
      <!-- Nombre -->
      <span class="font-semibold text-slate-900 flex-1 text-base">{{ cocktail.name }}</span>

      <!-- Badge de base -->
      <span data-testid="cocktail-base-badge" :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', baseColor]">
        {{ baseLabel[cocktail.base] }}
      </span>

      <!-- Badge adaptado -->
      <span
        v-if="cocktail.is_adapted"
        data-testid="cocktail-adapted-badge"
        class="rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-400 text-white"
        :title="cocktail.adaptation_note ?? ''"
      >
        Adaptado
      </span>

      <!-- Tipo de vaso -->
      <span class="text-xs text-slate-400 hidden sm:inline">
        {{ glassLabel[cocktail.glass] }}
      </span>

      <!-- Chevron -->
      <svg
        :class="['w-5 h-5 text-slate-400 transition-transform', isOpen && 'rotate-180']"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Contenido expandible -->
    <Transition name="expand">
      <div v-if="isOpen" data-testid="cocktail-card-content" class="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
        <!-- Descripción -->
        <p class="text-sm text-slate-600 italic">{{ cocktail.description }}</p>

        <!-- Ingredientes -->
        <div>
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ingredientes</h4>
          <ul class="space-y-0.5">
            <li v-for="ing in cocktail.ingredients" :key="ing.ingredient_id" class="text-sm text-slate-700">
              <span class="font-medium">{{ ing.amount }}</span> — {{ ing.name }}
              <span v-if="ing.note" class="text-slate-400">({{ ing.note }})</span>
            </li>
          </ul>
        </div>

        <!-- Pasos -->
        <div>
          <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Preparación</h4>
          <ol class="list-decimal list-inside space-y-1">
            <li v-for="(step, i) in cocktail.steps" :key="i" class="text-sm text-slate-700">
              {{ step }}
            </li>
          </ol>
        </div>

        <!-- Garnish -->
        <div v-if="cocktail.garnish" class="text-sm text-slate-600">
          <span class="font-medium">Decoración:</span> {{ cocktail.garnish }}
        </div>

        <!-- Vaso (mobile) -->
        <div class="text-sm text-slate-400 sm:hidden">
          {{ glassLabel[cocktail.glass] }}
        </div>

        <!-- Nota de adaptación -->
        <div v-if="cocktail.is_adapted && cocktail.adaptation_note" class="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
          {{ cocktail.adaptation_note }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CocktailWithAvailability } from '@/types'
import { baseColorClasses, glassLabel, baseLabel } from '@/utils/cocktailColors'

const props = defineProps<{
  cocktail: CocktailWithAvailability
}>()

const isOpen = ref(false)
const baseColor = baseColorClasses[props.cocktail.base]
</script>

<style scoped>
.expand-enter-active {
  transition: all 0.25s ease-out;
  overflow: hidden;
}
.expand-leave-active {
  transition: all 0.2s ease-in;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
}
</style>
