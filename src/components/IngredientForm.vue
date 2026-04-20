<template>
  <form
    class="flex flex-wrap items-end gap-3 p-4 bg-elevated/60 rounded-deco border border-border-app/60"
    @submit.prevent="handleSave"
  >
    <div class="flex-1 min-w-[200px]">
      <label class="block small-caps text-[0.62rem] text-muted mb-1">Nombre</label>
      <input
        v-model="name"
        type="text"
        required
        minlength="2"
        placeholder="Nombre del ingrediente"
        class="w-full rounded-md border-border-app/70 bg-surface text-sm"
      />
    </div>

    <div class="w-48">
      <label class="block small-caps text-[0.62rem] text-muted mb-1">Categoría</label>
      <select v-model="category" required class="w-full rounded-md border-border-app/70 bg-surface text-sm">
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
        class="px-4 py-2 small-caps text-xs font-medium text-ink-900 bg-accent rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Guardar
      </button>
      <button
        type="button"
        class="px-4 py-2 small-caps text-xs font-medium text-muted hover:text-fg rounded-full border border-border-app/70 transition-colors"
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
