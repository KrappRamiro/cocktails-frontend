<template>
  <div class="flex items-center gap-3 py-1.5 min-h-[44px]">
    <!-- Switch -->
    <button
      data-testid="ingredient-toggle"
      role="switch"
      :aria-checked="ingredient.is_available"
      :aria-label="`Disponibilidad de ${ingredient.name}`"
      :class="[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        ingredient.is_available ? 'bg-emerald-500' : 'bg-slate-300',
      ]"
      @click="$emit('toggle')"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform',
          ingredient.is_available ? 'translate-x-5' : 'translate-x-0',
        ]"
      />
    </button>

    <!-- Label -->
    <span class="flex-1 text-sm text-slate-700">{{ ingredient.name }}</span>

    <!-- Editar -->
    <button
      class="p-1.5 text-slate-400 hover:text-slate-600 rounded"
      aria-label="Editar ingrediente"
      @click="$emit('edit')"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>

    <!-- Eliminar -->
    <button
      class="p-1.5 text-slate-400 hover:text-red-500 rounded"
      aria-label="Eliminar ingrediente"
      @click="$emit('delete')"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '@/types'

defineProps<{ ingredient: Ingredient }>()
defineEmits<{ toggle: []; edit: []; delete: [] }>()
</script>
