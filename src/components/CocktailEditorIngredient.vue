<template>
  <div class="flex flex-wrap items-end gap-2 p-2 bg-slate-50 rounded-lg">
    <div class="flex-1 min-w-[160px]">
      <label :for="`ing-select-${uid}`" class="block text-xs text-slate-500 mb-0.5">Ingrediente</label>
      <select
        :id="`ing-select-${uid}`"
        :value="modelValue.ingredient_id"
        required
        class="w-full rounded-md border-slate-300 text-sm"
        @change="update('ingredient_id', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled>Seleccionar...</option>
        <optgroup
          v-for="cat in groupedIngredients"
          :key="cat.key"
          :label="cat.label"
        >
          <option v-for="ing in cat.items" :key="ing.id" :value="ing.id">
            {{ ing.name }}
          </option>
        </optgroup>
      </select>
    </div>

    <div class="w-24">
      <label :for="`ing-amount-${uid}`" class="block text-xs text-slate-500 mb-0.5">Cantidad</label>
      <input
        :id="`ing-amount-${uid}`"
        :value="modelValue.amount"
        type="text"
        required
        placeholder="50ml"
        class="w-full rounded-md border-slate-300 text-sm"
        @input="update('amount', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="w-32">
      <label :for="`ing-note-${uid}`" class="block text-xs text-slate-500 mb-0.5">Nota</label>
      <input
        :id="`ing-note-${uid}`"
        :value="modelValue.note ?? ''"
        type="text"
        placeholder="opcional"
        class="w-full rounded-md border-slate-300 text-sm"
        @input="update('note', ($event.target as HTMLInputElement).value || null)"
      />
    </div>

    <button
      type="button"
      class="p-2 text-slate-400 hover:text-red-500"
      aria-label="Eliminar ingrediente de la receta"
      @click="$emit('remove')"
    >
      &times;
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
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CocktailIngredientPayload]
  remove: []
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
