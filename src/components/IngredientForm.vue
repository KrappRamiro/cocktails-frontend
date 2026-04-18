<template>
  <form class="flex flex-wrap items-end gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200" @submit.prevent="handleSave">
    <div class="flex-1 min-w-[180px]">
      <label class="block text-xs font-medium text-slate-500 mb-1">Nombre</label>
      <input
        v-model="name"
        type="text"
        required
        minlength="2"
        placeholder="Nombre del ingrediente"
        class="w-full rounded-md border-slate-300 text-sm"
      />
    </div>

    <div class="w-48">
      <label class="block text-xs font-medium text-slate-500 mb-1">Categoría</label>
      <select v-model="category" required class="w-full rounded-md border-slate-300 text-sm">
        <option value="" disabled>Seleccionar...</option>
        <option v-for="cat in categoryOrder" :key="cat.key" :value="cat.key">
          {{ cat.label }}
        </option>
      </select>
    </div>

    <div class="flex gap-2">
      <button
        type="submit"
        :disabled="!isValid"
        class="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Guardar
      </button>
      <button
        type="button"
        class="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Ingredient, IngredientCategory } from '@/types'
import { categoryOrder } from '@/utils/cocktailColors'

const props = defineProps<{ ingredient: Ingredient | null }>()
const emit = defineEmits<{ save: [payload: { name: string; category: IngredientCategory }]; cancel: [] }>()

const name = ref(props.ingredient?.name ?? '')
const category = ref<IngredientCategory | ''>(props.ingredient?.category ?? '')

const isValid = computed(() => name.value.trim().length >= 2 && category.value !== '')

function handleSave() {
  if (!isValid.value) return
  emit('save', { name: name.value.trim(), category: category.value as IngredientCategory })
}
</script>
