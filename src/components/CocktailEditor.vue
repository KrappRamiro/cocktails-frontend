<template>
  <Teleport to="body">
    <Transition name="slide">
      <div v-if="true" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')" />

        <!-- Panel -->
        <div
          class="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl"
          role="dialog"
          aria-modal="true"
          @keydown.escape="$emit('cancel')"
        >
          <form data-testid="cocktail-editor-form" class="p-6 space-y-6" @submit.prevent="handleSubmit">
            <h2 class="text-xl font-bold text-slate-900">
              {{ cocktail ? 'Editar receta' : 'Nueva receta' }}
            </h2>

            <!-- Sección básica -->
            <section class="space-y-3">
              <div>
                <label for="name" class="block text-sm font-medium text-slate-700">Nombre *</label>
                <input id="name" v-model="form.name" type="text" required minlength="2"
                  class="mt-1 w-full rounded-md border-slate-300" :class="{ 'border-red-400': errors.name }" />
                <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-slate-700">Descripción *</label>
                <textarea id="description" v-model="form.description" required rows="2"
                  class="mt-1 w-full rounded-md border-slate-300" :class="{ 'border-red-400': errors.description }" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="base" class="block text-sm font-medium text-slate-700">Base *</label>
                  <select id="base" v-model="form.base" required class="mt-1 w-full rounded-md border-slate-300">
                    <option value="" disabled>Seleccionar...</option>
                    <option v-for="(label, key) in baseLabel" :key="key" :value="key">{{ label }}</option>
                  </select>
                </div>
                <div>
                  <label for="glass" class="block text-sm font-medium text-slate-700">Vaso *</label>
                  <select id="glass" v-model="form.glass" required class="mt-1 w-full rounded-md border-slate-300">
                    <option value="" disabled>Seleccionar...</option>
                    <option v-for="(label, key) in glassLabel" :key="key" :value="key">{{ label }}</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="garnish" class="block text-sm font-medium text-slate-700">Decoración</label>
                <input id="garnish" v-model="form.garnish" type="text" class="mt-1 w-full rounded-md border-slate-300" />
              </div>

              <div class="flex items-center gap-2">
                <input id="adapted" v-model="form.is_adapted" type="checkbox" class="rounded border-slate-300" />
                <label for="adapted" class="text-sm text-slate-700">Receta adaptada</label>
              </div>

              <div v-if="form.is_adapted">
                <label for="adaptation_note" class="block text-sm font-medium text-slate-700">Nota de adaptación</label>
                <input id="adaptation_note" v-model="form.adaptation_note" type="text" class="mt-1 w-full rounded-md border-slate-300" />
              </div>
            </section>

            <!-- Gustos -->
            <section>
              <h3 class="text-sm font-semibold text-slate-700 mb-2">Gustos *</h3>
              <div class="flex flex-wrap gap-2">
                <label v-for="(label, key) in tasteLabel" :key="key" class="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" :value="key" v-model="form.taste" class="rounded border-slate-300" />
                  {{ label }}
                </label>
              </div>
              <p v-if="errors.taste" class="mt-1 text-xs text-red-500">{{ errors.taste }}</p>
            </section>

            <!-- Ingredientes de la receta -->
            <section>
              <h3 class="text-sm font-semibold text-slate-700 mb-2">Ingredientes de la receta *</h3>
              <div class="space-y-2">
                <CocktailEditorIngredient
                  v-for="(ing, i) in form.ingredients"
                  :key="i"
                  :model-value="ing"
                  :ingredient-options="allIngredients"
                  @update:model-value="form.ingredients[i] = $event"
                  @remove="form.ingredients.splice(i, 1)"
                />
              </div>
              <button type="button" class="mt-2 text-sm text-sky-600 hover:text-sky-700 font-medium" @click="addIngredient">
                + Agregar ingrediente
              </button>
              <p v-if="errors.ingredients" class="mt-1 text-xs text-red-500">{{ errors.ingredients }}</p>
            </section>

            <!-- Ingredientes requeridos -->
            <section>
              <h3 class="text-sm font-semibold text-slate-700 mb-1">Ingredientes requeridos *</h3>
              <p class="text-xs text-slate-400 mb-2">Marcá los ingredientes indispensables para preparar este trago</p>
              <input v-model="requiredSearch" type="text" placeholder="Buscar ingrediente..." class="w-full rounded-md border-slate-300 text-sm mb-2" />
              <div class="max-h-48 overflow-y-auto space-y-1">
                <label
                  v-for="ing in filteredRequiredIngredients"
                  :key="ing.id"
                  class="flex items-center gap-2 text-sm py-0.5"
                >
                  <input type="checkbox" :value="ing.id" v-model="form.required_ingredients" class="rounded border-slate-300" />
                  <span :class="{ 'font-medium text-emerald-700': isInRecipe(ing.id) }">{{ ing.name }}</span>
                  <span v-if="isInRecipe(ing.id)" class="text-xs text-emerald-500">(en receta)</span>
                </label>
              </div>
              <p v-if="errors.required" class="mt-1 text-xs text-red-500">{{ errors.required }}</p>
            </section>

            <!-- Pasos -->
            <section>
              <h3 class="text-sm font-semibold text-slate-700 mb-2">Pasos de preparación *</h3>
              <div class="space-y-2">
                <div v-for="(step, i) in form.steps" :key="i" class="flex gap-2 items-start">
                  <span class="text-xs text-slate-400 mt-2.5 w-5 text-right">{{ i + 1 }}.</span>
                  <textarea v-model="form.steps[i]" rows="2" class="flex-1 rounded-md border-slate-300 text-sm" />
                  <div class="flex flex-col gap-0.5">
                    <button v-if="i > 0" type="button" class="text-slate-400 hover:text-slate-600 text-xs" @click="moveStep(i, -1)">&uarr;</button>
                    <button v-if="i < form.steps.length - 1" type="button" class="text-slate-400 hover:text-slate-600 text-xs" @click="moveStep(i, 1)">&darr;</button>
                    <button type="button" class="text-slate-400 hover:text-red-500 text-xs" @click="form.steps.splice(i, 1)">&times;</button>
                  </div>
                </div>
              </div>
              <button type="button" class="mt-2 text-sm text-sky-600 hover:text-sky-700 font-medium" @click="form.steps.push('')">
                + Agregar paso
              </button>
              <p v-if="errors.steps" class="mt-1 text-xs text-red-500">{{ errors.steps }}</p>
            </section>

            <!-- Botones -->
            <div class="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                data-testid="cocktail-editor-save"
                :disabled="saving"
                class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
              <button
                type="button"
                data-testid="cocktail-editor-cancel"
                class="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                @click="$emit('cancel')"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { CocktailWithAvailability, Ingredient, CocktailPayload, CocktailIngredientPayload, CocktailBase, CocktailTaste, GlassType } from '@/types'
import { baseLabel, glassLabel, tasteLabel } from '@/utils/cocktailColors'
import { createLogger } from '@/utils/logger'
import CocktailEditorIngredient from './CocktailEditorIngredient.vue'

const log = createLogger('CocktailEditor')

const props = defineProps<{
  cocktail: CocktailWithAvailability | null
  allIngredients: Ingredient[]
}>()

const emit = defineEmits<{
  save: [payload: CocktailPayload]
  cancel: []
}>()

const saving = ref(false)
const requiredSearch = ref('')

const form = reactive({
  name: props.cocktail?.name ?? '',
  description: props.cocktail?.description ?? '',
  base: (props.cocktail?.base ?? '') as CocktailBase | '',
  glass: (props.cocktail?.glass ?? '') as GlassType | '',
  garnish: props.cocktail?.garnish ?? '',
  is_adapted: props.cocktail?.is_adapted ?? false,
  adaptation_note: props.cocktail?.adaptation_note ?? '',
  taste: [...(props.cocktail?.taste ?? [])] as CocktailTaste[],
  ingredients: (props.cocktail?.ingredients ?? []).map((i) => ({
    ingredient_id: i.ingredient_id,
    amount: i.amount,
    note: i.note,
  })) as CocktailIngredientPayload[],
  steps: [...(props.cocktail?.steps ?? [''])],
  required_ingredients: [...(props.cocktail?.required_ingredients ?? [])] as string[],
})

const errors = reactive({
  name: '',
  description: '',
  taste: '',
  ingredients: '',
  required: '',
  steps: '',
})

const filteredRequiredIngredients = computed(() => {
  const search = requiredSearch.value.toLowerCase()
  if (!search) return props.allIngredients
  return props.allIngredients.filter((i) => i.name.toLowerCase().includes(search))
})

function isInRecipe(id: string): boolean {
  return form.ingredients.some((i) => i.ingredient_id === id)
}

function addIngredient() {
  form.ingredients.push({ ingredient_id: '', amount: '', note: null })
}

function moveStep(index: number, direction: number) {
  const target = index + direction
  const tmp = form.steps[index]
  form.steps[index] = form.steps[target]
  form.steps[target] = tmp
}

function validate(): boolean {
  let valid = true
  errors.name = form.name.trim().length < 2 ? 'Nombre requerido (mín. 2 caracteres)' : ''
  errors.description = form.description.trim() === '' ? 'Descripción requerida' : ''
  errors.taste = form.taste.length === 0 ? 'Seleccioná al menos un gusto' : ''
  errors.ingredients = form.ingredients.length === 0 ? 'Agregá al menos un ingrediente' : ''
  errors.required = form.required_ingredients.length === 0 ? 'Seleccioná al menos un ingrediente requerido' : ''
  errors.steps = form.steps.filter((s) => s.trim()).length === 0 ? 'Agregá al menos un paso' : ''

  if (errors.name || errors.description || errors.taste || errors.ingredients || errors.required || errors.steps) {
    valid = false
    log.warn('Form validation failed', { errors: { ...errors } })
  }
  return valid
}

function handleSubmit() {
  if (!validate()) return

  const payload: CocktailPayload = {
    name: form.name.trim(),
    description: form.description.trim(),
    base: form.base as CocktailBase,
    glass: form.glass as GlassType,
    garnish: form.garnish.trim(),
    is_adapted: form.is_adapted,
    adaptation_note: form.is_adapted ? form.adaptation_note.trim() || null : null,
    taste: form.taste,
    ingredients: form.ingredients.filter((i) => i.ingredient_id && i.amount),
    steps: form.steps.filter((s) => s.trim()),
    required_ingredients: form.required_ingredients,
  }

  emit('save', payload)
}
</script>

<style scoped>
.slide-enter-active { transition: transform 0.3s ease-out; }
.slide-leave-active { transition: transform 0.2s ease-in; }
.slide-enter-from { transform: translateX(100%); }
.slide-leave-to { transform: translateX(100%); }
</style>
