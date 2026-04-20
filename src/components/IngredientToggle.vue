<template>
  <div
    :class="[
      'group flex flex-col rounded-deco border border-transparent transition-colors',
      expanded ? 'bg-elevated/60 border-border-app/50' : 'hover:bg-elevated/30',
    ]"
  >
    <div class="flex items-center gap-3 px-3 py-2 min-h-[48px]">
      <!-- Switch -->
      <button
        data-testid="ingredient-toggle"
        role="switch"
        :aria-checked="ingredient.is_available"
        :aria-label="`Disponibilidad de ${ingredient.name}`"
        :class="[
          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors',
          ingredient.is_available ? 'bg-accent' : 'bg-elevated border border-border-app/70',
        ]"
        @click.stop="$emit('toggle')"
      >
        <span
          :class="[
            'absolute top-0.5 inline-block h-5 w-5 rounded-full bg-bone-50 shadow-deco-sm transform transition-transform',
            ingredient.is_available ? 'translate-x-5' : 'translate-x-0.5',
          ]"
        />
      </button>

      <!-- Label + usage -->
      <button
        type="button"
        class="flex-1 flex items-center gap-3 text-left"
        :aria-expanded="expanded"
        :aria-controls="`usage-${ingredient.id}`"
        @click="toggleExpand"
      >
        <span class="text-sm text-fg truncate">{{ ingredient.name }}</span>
        <span
          v-if="usage"
          :class="[
            'shrink-0 small-caps text-[0.6rem] rounded-full border px-2 py-0.5 transition-colors',
            usage.count > 0
              ? 'border-accent/40 text-accent/90'
              : 'border-border-app/50 text-muted/70',
          ]"
        >
          {{ usage.count > 0 ? `usado en ${usage.count}` : 'sin uso' }}
        </span>

        <svg
          v-if="usage && usage.count > 0"
          :class="['w-3.5 h-3.5 text-muted shrink-0 transition-transform', expanded && 'rotate-180']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Edit -->
      <button
        class="p-1.5 text-muted hover:text-accent rounded transition-colors"
        aria-label="Editar ingrediente"
        @click.stop="$emit('edit')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <!-- Delete -->
      <button
        class="p-1.5 text-muted hover:text-danger rounded transition-colors"
        aria-label="Eliminar ingrediente"
        @click.stop="$emit('delete')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <!-- Usage expansion -->
    <div
      v-if="expanded && usage && usage.count > 0"
      :id="`usage-${ingredient.id}`"
      class="px-3 pb-3 pt-1"
    >
      <p class="small-caps text-[0.6rem] text-accent/80 mb-2">recetas que lo usan</p>
      <ul class="flex flex-wrap gap-1.5">
        <li v-for="r in usage.recipes" :key="r.id">
          <button
            class="text-xs text-muted hover:text-accent border border-border-app/40 hover:border-accent/60 rounded-full px-2.5 py-1 transition-colors"
            @click.stop="$emit('openRecipe', r.id)"
          >
            {{ r.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ingredient } from '@/types'

export interface IngredientUsage {
  count: number
  recipes: { id: string; name: string }[]
}

defineProps<{
  ingredient: Ingredient
  usage?: IngredientUsage
}>()

defineEmits<{
  toggle: []
  edit: []
  delete: []
  openRecipe: [cocktailId: string]
}>()

const expanded = ref(false)

function toggleExpand() {
  expanded.value = !expanded.value
}
</script>
