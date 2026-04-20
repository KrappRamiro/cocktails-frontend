<template>
  <div class="bg-elevated/50 border border-border-app/60 rounded-deco p-3 flex flex-wrap items-end gap-3">
    <!-- Required toggle (star) -->
    <button
      type="button"
      role="switch"
      :aria-checked="isRequired"
      :aria-label="`${isRequired ? 'Desmarcar' : 'Marcar'} como imprescindible`"
      :title="isRequired ? 'Imprescindible — sin esto no se puede servir' : 'Opcional — el trago se puede servir sin esto'"
      :class="[
        'shrink-0 h-9 w-9 rounded-full border grid place-items-center transition-colors',
        isRequired
          ? 'border-accent bg-accent/15 text-accent'
          : 'border-border-app/50 text-muted hover:border-accent/50 hover:text-accent',
      ]"
      @click="$emit('toggle-required')"
    >
      <svg
        v-if="isRequired"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="1"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <svg
        v-else
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
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>

    <div class="flex-1 min-w-[160px]">
      <label :for="`ing-select-${uid}`" class="block small-caps text-[0.6rem] text-muted mb-1">
        Ingrediente
      </label>
      <select
        :id="`ing-select-${uid}`"
        :value="modelValue.ingredient_id"
        required
        class="w-full rounded-md border-border-app/70 bg-surface text-sm"
        @change="update('ingredient_id', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>Seleccionar...</option>
        <optgroup v-for="cat in groupedIngredients" :key="cat.key" :label="cat.label">
          <option v-for="ing in cat.items" :key="ing.id" :value="ing.id">
            {{ ing.name }}
          </option>
        </optgroup>
      </select>
    </div>

    <div class="w-24">
      <label :for="`ing-amount-${uid}`" class="block small-caps text-[0.6rem] text-muted mb-1">
        Cantidad
      </label>
      <input
        :id="`ing-amount-${uid}`"
        :value="modelValue.amount"
        type="text"
        required
        placeholder="50ml"
        class="w-full rounded-md border-border-app/70 bg-surface text-sm"
        @input="update('amount', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="w-32">
      <label :for="`ing-note-${uid}`" class="block small-caps text-[0.6rem] text-muted mb-1">
        Nota
      </label>
      <input
        :id="`ing-note-${uid}`"
        :value="modelValue.note ?? ''"
        type="text"
        placeholder="opcional"
        class="w-full rounded-md border-border-app/70 bg-surface text-sm"
        @input="update('note', ($event.target as HTMLInputElement).value || null)"
      />
    </div>

    <button
      type="button"
      class="h-9 w-9 shrink-0 grid place-items-center text-muted hover:text-danger rounded-full transition-colors"
      aria-label="Quitar ingrediente de la receta"
      @click="$emit('remove')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CocktailIngredientPayload, Ingredient } from '@/types'
import { categoryOrder } from '@/utils/cocktailColors'

const props = defineProps<{
  modelValue: CocktailIngredientPayload
  ingredientOptions: Ingredient[]
  isRequired: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CocktailIngredientPayload]
  remove: []
  'toggle-required': []
}>()

const uid = Math.random().toString(36).slice(2, 8)

const groupedIngredients = computed(() =>
  categoryOrder
    .map((cat) => ({
      key: cat.key,
      label: cat.label,
      items: props.ingredientOptions.filter((i) => i.category === cat.key),
    }))
    .filter((cat) => cat.items.length > 0),
)

function update(field: string, value: string | null) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>
