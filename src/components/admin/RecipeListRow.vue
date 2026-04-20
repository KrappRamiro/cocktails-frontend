<template>
  <div
    class="group relative bg-surface border border-border-app/70 rounded-deco px-4 py-3 flex items-center gap-3 hover:border-accent/40 transition-colors"
  >
    <!-- Availability -->
    <span
      :aria-label="cocktail.is_available ? 'Disponible' : 'No disponible'"
      :class="[
        'shrink-0 h-2 w-2 rounded-full',
        cocktail.is_available ? 'bg-accent shadow-[0_0_0_3px] shadow-accent/15' : 'bg-muted/40',
      ]"
    />

    <!-- Name + base -->
    <div class="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span class="font-display text-[1.05rem] text-fg truncate">{{ cocktail.name }}</span>
      <span class="small-caps text-[0.6rem] text-accent/80">
        {{ baseLabel[cocktail.base] }}
      </span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="h-8 w-8 grid place-items-center rounded-full text-muted hover:text-accent hover:bg-accent/10 transition-colors"
        :aria-label="`Clonar ${cocktail.name}`"
        title="Clonar"
        @click="$emit('clone')"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      <button
        type="button"
        class="h-8 px-3 small-caps text-[0.65rem] text-accent border border-accent/50 rounded-full hover:bg-accent/10 transition-colors"
        @click="$emit('edit')"
      >
        Editar
      </button>

      <button
        type="button"
        class="h-8 w-8 grid place-items-center rounded-full text-muted hover:text-danger transition-colors"
        :aria-label="`Eliminar ${cocktail.name}`"
        title="Eliminar"
        @click="$emit('remove')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CocktailWithAvailability } from '@/types'
import { baseLabel } from '@/utils/cocktailColors'

defineProps<{ cocktail: CocktailWithAvailability }>()
defineEmits<{ edit: []; clone: []; remove: [] }>()
</script>
