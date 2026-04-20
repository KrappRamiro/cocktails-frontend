<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="true"
        class="fixed inset-0 z-50 flex items-stretch md:items-center justify-center"
        @keydown.escape="$emit('cancel')"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-ink-900/75 backdrop-blur-sm"
          @click="$emit('cancel')"
        />

        <!-- Panel -->
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-title"
          class="relative bg-surface text-fg md:rounded-deco shadow-deco border border-border-app/60 w-full md:max-w-[880px] md:max-h-[92vh] flex flex-col overflow-hidden"
        >
          <!-- Deco corners -->
          <span aria-hidden class="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l border-t border-accent/70" />
          <span aria-hidden class="pointer-events-none absolute right-4 top-4 h-4 w-4 border-r border-t border-accent/70" />
          <span aria-hidden class="pointer-events-none absolute left-4 bottom-4 h-4 w-4 border-l border-b border-accent/70" />
          <span aria-hidden class="pointer-events-none absolute right-4 bottom-4 h-4 w-4 border-r border-b border-accent/70" />

          <!-- Header -->
          <header class="px-6 pt-6 pb-4 border-b border-border-app/60 text-center">
            <p class="small-caps text-[0.65rem] text-accent/80 mb-1">
              {{ mode === 'edit' ? 'editar' : mode === 'clone' ? 'clonar' : 'nueva' }} receta
            </p>
            <h2 id="editor-title" class="font-display text-3xl leading-tight text-fg">
              {{ form.name || 'Sin título' }}
            </h2>
          </header>

          <form
            data-testid="cocktail-editor-form"
            class="flex-1 overflow-y-auto px-5 md:px-8 py-6"
            @submit.prevent="handleSubmit"
          >
            <div class="grid md:grid-cols-2 gap-x-10 gap-y-6">
              <!-- Left column: basic data -->
              <div class="space-y-5">
                <!-- Name + adapted -->
                <div>
                  <label for="name" class="block small-caps text-[0.62rem] text-muted mb-1">Nombre *</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    minlength="2"
                    class="w-full rounded-md bg-base border-border-app/70"
                    :class="{ 'border-danger': errors.name }"
                  />
                  <p v-if="errors.name" class="mt-1 text-xs text-danger">{{ errors.name }}</p>
                </div>

                <div>
                  <label for="description" class="block small-caps text-[0.62rem] text-muted mb-1">Descripción *</label>
                  <textarea
                    id="description"
                    v-model="form.description"
                    required
                    rows="2"
                    class="w-full rounded-md bg-base border-border-app/70"
                    :class="{ 'border-danger': errors.description }"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="base" class="block small-caps text-[0.62rem] text-muted mb-1">Base *</label>
                    <select
                      id="base"
                      v-model="form.base"
                      required
                      class="w-full rounded-md bg-base border-border-app/70"
                    >
                      <option value="" disabled>Seleccionar...</option>
                      <option v-for="(label, key) in baseLabel" :key="key" :value="key">
                        {{ label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label for="glass" class="block small-caps text-[0.62rem] text-muted mb-1">Vaso *</label>
                    <select
                      id="glass"
                      v-model="form.glass"
                      required
                      class="w-full rounded-md bg-base border-border-app/70"
                    >
                      <option value="" disabled>Seleccionar...</option>
                      <option v-for="(label, key) in glassLabel" :key="key" :value="key">
                        {{ label }}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label for="garnish" class="block small-caps text-[0.62rem] text-muted mb-1">Decoración</label>
                  <input
                    id="garnish"
                    v-model="form.garnish"
                    type="text"
                    class="w-full rounded-md bg-base border-border-app/70"
                  />
                </div>

                <!-- Adapted -->
                <div class="space-y-2">
                  <label class="flex items-center gap-2 small-caps text-xs text-fg">
                    <input
                      id="adapted"
                      v-model="form.is_adapted"
                      type="checkbox"
                      class="rounded border-border-app/70 bg-base text-accent focus:ring-accent"
                    />
                    <span>Receta adaptada</span>
                  </label>
                  <div v-if="form.is_adapted">
                    <label for="adaptation_note" class="block small-caps text-[0.6rem] text-muted mb-1">
                      Nota de adaptación
                    </label>
                    <input
                      id="adaptation_note"
                      v-model="form.adaptation_note"
                      type="text"
                      class="w-full rounded-md bg-base border-border-app/70"
                    />
                  </div>
                </div>

                <!-- Tastes -->
                <div>
                  <h3 class="small-caps text-[0.62rem] text-muted mb-2">Gustos *</h3>
                  <div class="flex flex-wrap gap-2">
                    <label
                      v-for="(label, key) in tasteLabel"
                      :key="key"
                      class="cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :value="key"
                        v-model="form.taste"
                        class="peer sr-only"
                      />
                      <span
                        class="inline-block px-3 py-1.5 rounded-full small-caps text-[0.65rem] border border-border-app/60 text-muted transition-colors peer-checked:border-accent peer-checked:text-accent peer-checked:bg-accent/10"
                      >
                        {{ label }}
                      </span>
                    </label>
                  </div>
                  <p v-if="errors.taste" class="mt-1 text-xs text-danger">{{ errors.taste }}</p>
                </div>
              </div>

              <!-- Right column: ingredients + steps -->
              <div class="space-y-6">
                <!-- Ingredients -->
                <section>
                  <div class="flex items-baseline justify-between mb-2">
                    <h3 class="small-caps text-[0.62rem] text-muted">Ingredientes *</h3>
                    <p class="text-[0.6rem] small-caps text-accent/70">
                      ⭐ = imprescindible
                    </p>
                  </div>
                  <div class="space-y-2">
                    <CocktailEditorIngredient
                      v-for="(ing, i) in form.ingredients"
                      :key="ing._key"
                      :model-value="{ ingredient_id: ing.ingredient_id, amount: ing.amount, note: ing.note }"
                      :ingredient-options="allIngredients"
                      :is-required="isRowRequired(ing)"
                      @update:model-value="updateIngredient(i, $event)"
                      @remove="removeIngredient(i)"
                      @toggle-required="toggleRequired(i)"
                    />
                  </div>
                  <button
                    type="button"
                    class="mt-3 small-caps text-[0.65rem] text-accent hover:text-accent-hover transition-colors"
                    @click="addIngredient"
                  >
                    + Agregar ingrediente
                  </button>
                  <p v-if="errors.ingredients" class="mt-2 text-xs text-danger">{{ errors.ingredients }}</p>
                  <p v-if="errors.required" class="mt-1 text-xs text-danger">{{ errors.required }}</p>
                </section>

                <!-- Steps -->
                <section>
                  <h3 class="small-caps text-[0.62rem] text-muted mb-2">Preparación *</h3>
                  <div class="space-y-2">
                    <div v-for="(_step, i) in form.steps" :key="i" class="flex gap-2 items-start">
                      <span class="font-display text-accent/80 w-5 text-right pt-2">{{ i + 1 }}.</span>
                      <textarea
                        v-model="form.steps[i]"
                        rows="2"
                        class="flex-1 rounded-md bg-base border-border-app/70 text-sm"
                      />
                      <div class="flex flex-col gap-0.5 text-muted pt-1">
                        <button
                          v-if="i > 0"
                          type="button"
                          class="hover:text-accent transition-colors text-xs"
                          aria-label="Subir paso"
                          @click="moveStep(i, -1)"
                        >↑</button>
                        <button
                          v-if="i < form.steps.length - 1"
                          type="button"
                          class="hover:text-accent transition-colors text-xs"
                          aria-label="Bajar paso"
                          @click="moveStep(i, 1)"
                        >↓</button>
                        <button
                          type="button"
                          class="hover:text-danger transition-colors text-xs"
                          aria-label="Eliminar paso"
                          @click="form.steps.splice(i, 1)"
                        >×</button>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="mt-3 small-caps text-[0.65rem] text-accent hover:text-accent-hover transition-colors"
                    @click="form.steps.push('')"
                  >
                    + Agregar paso
                  </button>
                  <p v-if="errors.steps" class="mt-2 text-xs text-danger">{{ errors.steps }}</p>
                </section>
              </div>
            </div>
          </form>

          <!-- Sticky footer -->
          <footer class="shrink-0 px-5 md:px-8 py-4 border-t border-border-app/60 flex items-center gap-3 bg-surface">
            <button
              v-if="mode === 'edit'"
              type="button"
              data-testid="cocktail-editor-clone"
              class="h-10 px-4 small-caps text-xs text-accent border border-accent/50 rounded-full hover:bg-accent/10 transition-colors"
              @click="$emit('clone')"
            >
              Clonar
            </button>
            <span class="flex-1" />
            <button
              type="button"
              data-testid="cocktail-editor-cancel"
              class="h-10 px-4 small-caps text-xs text-muted hover:text-fg border border-border-app/70 rounded-full transition-colors"
              @click="$emit('cancel')"
            >
              Cancelar
            </button>
            <button
              type="button"
              data-testid="cocktail-editor-save"
              :disabled="saving"
              class="h-10 px-6 small-caps text-xs font-medium text-ink-900 bg-accent rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50"
              @click="handleSubmit"
            >
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { CocktailWithAvailability, Ingredient, CocktailPayload, CocktailBase, CocktailTaste, GlassType } from '@/types'
import { baseLabel, glassLabel, tasteLabel } from '@/utils/cocktailColors'
import { createLogger } from '@/utils/logger'
import CocktailEditorIngredient from './CocktailEditorIngredient.vue'

const log = createLogger('CocktailEditor')

type EditorMode = 'edit' | 'clone' | 'new'

interface RowState {
  _key: number
  ingredient_id: string
  amount: string
  note: string | null
  required: boolean
}

const props = defineProps<{
  cocktail: CocktailWithAvailability | null
  allIngredients: Ingredient[]
  /**
   * When set, the form is pre-filled with this payload (for clone flows) rather
   * than the `cocktail` shape. `cocktail` must be null in that case.
   */
  initialPayload?: CocktailPayload | null
  mode?: EditorMode
}>()

const emit = defineEmits<{
  save: [payload: CocktailPayload]
  cancel: []
  clone: []
}>()

const saving = ref(false)

// ─── Form init ──────────────────────────────────────────────────────────────

// Priority: initialPayload > cocktail > empty defaults
const source = props.initialPayload ?? props.cocktail

let rowKey = 0
function makeRow(
  ingredient_id: string,
  amount: string,
  note: string | null,
  required: boolean,
): RowState {
  return { _key: rowKey++, ingredient_id, amount, note, required }
}

const initialRequired = new Set(
  (props.initialPayload?.required_ingredients ?? props.cocktail?.required_ingredients ?? []).map(
    String,
  ),
)

const initialIngredients: RowState[] = (source?.ingredients ?? []).map((i) =>
  makeRow(
    String(i.ingredient_id),
    i.amount,
    i.note,
    initialRequired.has(String(i.ingredient_id)),
  ),
)

const form = reactive({
  name: source?.name ?? '',
  description: source?.description ?? '',
  base: (source?.base ?? '') as CocktailBase | '',
  glass: (source?.glass ?? '') as GlassType | '',
  garnish: source?.garnish ?? '',
  is_adapted: source?.is_adapted ?? false,
  adaptation_note: source?.adaptation_note ?? '',
  taste: [...(source?.taste ?? [])] as CocktailTaste[],
  ingredients: initialIngredients,
  steps: [...(source?.steps ?? [''])],
})

const errors = reactive({
  name: '',
  description: '',
  taste: '',
  ingredients: '',
  required: '',
  steps: '',
})

function isRowRequired(row: RowState): boolean {
  return row.required
}

function updateIngredient(
  index: number,
  next: { ingredient_id: string; amount: string; note: string | null },
) {
  const row = form.ingredients[index]
  // If ingredient changes, it stops being required (user must re-flag)
  if (row.ingredient_id !== next.ingredient_id) {
    row.required = false
  }
  row.ingredient_id = next.ingredient_id
  row.amount = next.amount
  row.note = next.note
}

function toggleRequired(index: number) {
  const row = form.ingredients[index]
  row.required = !row.required
}

function removeIngredient(index: number) {
  form.ingredients.splice(index, 1)
}

function addIngredient() {
  form.ingredients.push(makeRow('', '', null, false))
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
  const filledIngredients = form.ingredients.filter((i) => i.ingredient_id && i.amount)
  errors.ingredients = filledIngredients.length === 0 ? 'Agregá al menos un ingrediente' : ''
  const requiredCount = filledIngredients.filter((i) => i.required).length
  errors.required = requiredCount === 0
    ? 'Marcá al menos un ingrediente como imprescindible (⭐)'
    : ''
  errors.steps = form.steps.filter((s) => s.trim()).length === 0 ? 'Agregá al menos un paso' : ''

  if (errors.name || errors.description || errors.taste || errors.ingredients || errors.required || errors.steps) {
    valid = false
    log.warn('Form validation failed', { errors: { ...errors } })
  }
  return valid
}

function handleSubmit() {
  if (!validate()) return

  const cleanIngredients = form.ingredients.filter((i) => i.ingredient_id && i.amount)
  const requiredIds = cleanIngredients
    .filter((i) => i.required)
    .map((i) => i.ingredient_id)

  const payload: CocktailPayload = {
    name: form.name.trim(),
    description: form.description.trim(),
    base: form.base as CocktailBase,
    glass: form.glass as GlassType,
    garnish: form.garnish.trim(),
    is_adapted: form.is_adapted,
    adaptation_note: form.is_adapted ? form.adaptation_note.trim() || null : null,
    taste: form.taste,
    ingredients: cleanIngredients.map((i) => ({
      ingredient_id: i.ingredient_id,
      amount: i.amount,
      note: i.note,
    })),
    steps: form.steps.filter((s) => s.trim()),
    required_ingredients: requiredIds,
  }

  saving.value = true
  emit('save', payload)
  // Parent clears saving/closes when async save resolves.
}

// Expose computed `mode` default if not given
const mode = computed<EditorMode>(() => props.mode ?? (props.cocktail ? 'edit' : props.initialPayload ? 'clone' : 'new'))
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > [role='dialog'],
.modal-leave-active > [role='dialog'] {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > [role='dialog'],
.modal-leave-to > [role='dialog'] {
  transform: scale(0.98);
  opacity: 0;
}
</style>
