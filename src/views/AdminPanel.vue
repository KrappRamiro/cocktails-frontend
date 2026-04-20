<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Login -->
    <div v-if="!store.isAuthenticated" class="min-h-screen flex items-center justify-center px-4">
      <form data-testid="login-form" class="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm space-y-4" @submit.prevent="handleLogin">
        <h1 class="text-xl font-bold text-slate-900 text-center">Panel de administración</h1>

        <div>
          <label for="user" class="block text-sm font-medium text-slate-700">Usuario</label>
          <input id="user" data-testid="login-user" v-model="loginUser" type="text" required autocomplete="username"
            class="mt-1 w-full rounded-md border-slate-300" />
        </div>

        <div>
          <label for="pass" class="block text-sm font-medium text-slate-700">Contraseña</label>
          <input id="pass" data-testid="login-pass" v-model="loginPass" type="password" required autocomplete="current-password"
            class="mt-1 w-full rounded-md border-slate-300" />
        </div>

        <button
          type="submit"
          data-testid="login-submit"
          :disabled="loginLoading"
          class="w-full py-2.5 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          {{ loginLoading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>

    <!-- Panel -->
    <div v-else>
      <!-- Header -->
      <header class="bg-slate-800 text-white px-4 py-4 flex items-center justify-between">
        <h1 class="font-bold">{{ eventName }} — Admin</h1>
        <button data-testid="logout-button" class="text-sm text-slate-300 hover:text-white" @click="store.logout()">
          Cerrar sesión
        </button>
      </header>

      <!-- Sync indicator -->
      <div v-if="store.syncStatus === 'saving'" data-testid="sync-status" class="bg-amber-50 text-amber-700 text-center text-sm py-1.5 sticky top-0 z-10">
        Guardando...
      </div>
      <div v-else-if="store.syncStatus === 'saved'" data-testid="sync-status" class="bg-emerald-50 text-emerald-700 text-center text-sm py-1.5 sticky top-0 z-10">
        Guardado
      </div>

      <!-- Tab bar -->
      <nav class="flex border-b border-slate-200 bg-white sticky top-0 z-10">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :data-testid="`tab-${tab.key}`"
          :class="[
            'flex-1 py-3 text-sm font-medium text-center transition-colors',
            activeTab === tab.key
              ? 'text-slate-900 border-b-2 border-slate-800'
              : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- Tab content -->
      <main class="p-4">
        <!-- Ingredientes -->
        <div v-if="activeTab === 'ingredients'">
          <button
            data-testid="new-ingredient-button"
            class="mb-4 text-sm text-sky-600 hover:text-sky-700 font-medium"
            @click="showIngredientForm = !showIngredientForm"
          >
            + Nuevo ingrediente
          </button>

          <input
            v-model="ingredientSearch"
            data-testid="ingredient-search"
            type="text"
            placeholder="Buscar ingrediente..."
            class="w-full rounded-lg border-slate-300 text-sm px-3 py-2 mb-4"
          />

          <IngredientForm
            v-if="showIngredientForm"
            :ingredient="null"
            class="mb-4"
            @save="handleCreateIngredient"
            @cancel="showIngredientForm = false"
          />

          <div v-for="cat in filteredIngredientsByCategory" :key="cat.key" class="mb-6">
            <div v-if="cat.items.length > 0">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wide">{{ cat.label }}</h3>
                <button class="text-xs text-slate-400 hover:text-slate-600" @click="toggleAllInCategory(cat.key, cat.items)">
                  {{ allAvailableInCategory(cat.items) ? 'Desmarcar todos' : 'Marcar todos' }}
                </button>
              </div>

              <div class="space-y-0.5">
                <template v-for="ing in cat.items" :key="ing.id">
                  <IngredientToggle
                    :ingredient="ing"
                    @toggle="store.toggleIngredient(ing.id)"
                    @edit="editingIngredientId = editingIngredientId === ing.id ? null : ing.id"
                    @delete="confirmDeleteIngredient(ing)"
                  />
                  <IngredientForm
                    v-if="editingIngredientId === ing.id"
                    :ingredient="ing"
                    @save="(p) => handleUpdateIngredient(ing.id, p)"
                    @cancel="editingIngredientId = null"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Recetas -->
        <div v-if="activeTab === 'recipes'">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900">Recetas ({{ store.cocktails.length }})</h2>
            <button
              data-testid="new-recipe-button"
              class="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              @click="openEditor(null)"
            >
              + Nueva receta
            </button>
          </div>

          <input
            v-model="recipeSearch"
            data-testid="recipe-search"
            type="text"
            placeholder="Buscar receta..."
            class="w-full rounded-lg border-slate-300 text-sm px-3 py-2 mb-3"
          />

          <div class="space-y-2">
            <div
              v-for="c in sortedCocktails"
              :key="c.id"
              class="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center gap-3"
            >
              <span class="flex-1 font-medium text-sm text-slate-900">{{ c.name }}</span>
              <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', baseColorClasses[c.base]]">
                {{ baseLabel[c.base] }}
              </span>
              <span :class="c.is_available ? 'text-emerald-500' : 'text-slate-300'" class="text-sm">
                {{ c.is_available ? '&#10003;' : '&#10005;' }}
              </span>
              <button class="text-sm text-sky-600 hover:text-sky-700" @click="openEditor(c)">Editar</button>
              <button class="text-sm text-red-500 hover:text-red-600" @click="confirmDeleteCocktail(c)">Eliminar</button>
            </div>
          </div>
        </div>

        <!-- Vista previa -->
        <div v-if="activeTab === 'preview'">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Disponibilidad</h2>
          <div data-testid="availability-stats" class="bg-white rounded-lg border border-slate-200 p-4 space-y-2 font-mono text-sm">
            <div v-for="stat in store.availabilityStats.byBase" :key="stat.base" class="flex justify-between">
              <span class="text-slate-600">{{ stat.label }}</span>
              <span class="text-slate-900 font-semibold">{{ stat.available }} / {{ stat.total }}</span>
            </div>
            <div class="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{{ store.availabilityStats.available }} / {{ store.availabilityStats.total }}</span>
            </div>
          </div>

          <a href="/" target="_blank" class="mt-4 inline-block text-sm text-sky-600 hover:text-sky-700 font-medium">
            Ver menú público &rarr;
          </a>
        </div>
      </main>

      <!-- Cocktail editor (modal) -->
      <CocktailEditor
        v-if="editorOpen"
        :cocktail="editorCocktail"
        :all-ingredients="store.ingredients"
        @save="handleSaveCocktail"
        @cancel="editorOpen = false"
      />

      <!-- Confirm dialog -->
      <ConfirmDialog
        :open="confirmOpen"
        :title="confirmTitle"
        :message="confirmMessage"
        :confirm-label="confirmLabel"
        confirm-style="danger"
        @confirm="confirmAction?.()"
        @cancel="confirmOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { baseColorClasses, baseLabel } from '@/utils/cocktailColors'
import type { Ingredient, CocktailWithAvailability, CocktailPayload, IngredientPayload } from '@/types'
import IngredientToggle from '@/components/IngredientToggle.vue'
import IngredientForm from '@/components/IngredientForm.vue'
import CocktailEditor from '@/components/CocktailEditor.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const store = useAdminStore()
const eventName = import.meta.env.VITE_EVENT_NAME || 'Evento'

// ─── Login ─────────────────────────────────────────────────────────────────
const loginUser = ref('')
const loginPass = ref('')
const loginLoading = ref(false)

async function handleLogin() {
  loginLoading.value = true
  await store.login(loginUser.value, loginPass.value)
  loginLoading.value = false
}

// ─── Tabs ──────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'ingredients', label: 'Ingredientes' },
  { key: 'recipes', label: 'Recetas' },
  { key: 'preview', label: 'Vista previa' },
] as const
const activeTab = ref<'ingredients' | 'recipes' | 'preview'>('ingredients')

// ─── Ingredients ───────────────────────────────────────────────────────────
const showIngredientForm = ref(false)
const editingIngredientId = ref<string | null>(null)
const ingredientSearch = ref('')

const filteredIngredientsByCategory = computed(() => {
  const q = ingredientSearch.value.toLowerCase().trim()
  if (!q) return store.ingredientsByCategory
  return store.ingredientsByCategory.map((cat) => ({
    ...cat,
    items: cat.items.filter((i) => i.name.toLowerCase().includes(q)),
  }))
})

async function handleCreateIngredient(payload: IngredientPayload) {
  await store.createIngredient(payload)
  showIngredientForm.value = false
}

async function handleUpdateIngredient(id: string, payload: IngredientPayload) {
  await store.updateIngredient(id, payload)
  editingIngredientId.value = null
}

function allAvailableInCategory(items: Ingredient[]): boolean {
  return items.every((i) => i.is_available)
}

async function toggleAllInCategory(_key: string, items: Ingredient[]) {
  const allAvailable = allAvailableInCategory(items)
  for (const item of items) {
    if (allAvailable && item.is_available) {
      await store.toggleIngredient(item.id)
    } else if (!allAvailable && !item.is_available) {
      await store.toggleIngredient(item.id)
    }
  }
}

// ─── Cocktails ─────────────────────────────────────────────────────────────
const editorOpen = ref(false)
const editorCocktail = ref<CocktailWithAvailability | null>(null)
const recipeSearch = ref('')

const sortedCocktails = computed(() => {
  const sorted = [...store.cocktails].sort((a, b) => a.base.localeCompare(b.base) || a.name.localeCompare(b.name))
  const q = recipeSearch.value.toLowerCase().trim()
  if (!q) return sorted
  return sorted.filter((c) => c.name.toLowerCase().includes(q))
})

function openEditor(cocktail: CocktailWithAvailability | null) {
  editorCocktail.value = cocktail
  editorOpen.value = true
}

async function handleSaveCocktail(payload: CocktailPayload) {
  if (editorCocktail.value) {
    await store.updateCocktail(editorCocktail.value.id, payload)
  } else {
    await store.createCocktail(payload)
  }
  editorOpen.value = false
}

// ─── Confirm dialog ────────────────────────────────────────────────────────
const confirmOpen = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmLabel = ref('Eliminar')
const confirmAction = ref<(() => void) | null>(null)

function confirmDeleteIngredient(ing: Ingredient) {
  confirmTitle.value = `Eliminar ${ing.name}`
  confirmMessage.value = 'Esta acción no se puede deshacer.'
  confirmLabel.value = 'Eliminar'
  confirmAction.value = async () => {
    confirmOpen.value = false
    await store.deleteIngredient(ing.id)
  }
  confirmOpen.value = true
}

function confirmDeleteCocktail(c: CocktailWithAvailability) {
  confirmTitle.value = `Eliminar ${c.name}`
  confirmMessage.value = 'Esta acción no se puede deshacer.'
  confirmLabel.value = 'Eliminar'
  confirmAction.value = async () => {
    confirmOpen.value = false
    await store.deleteCocktail(c.id)
  }
  confirmOpen.value = true
}

// ─── Init ──────────────────────────────────────────────────────────────────
onMounted(() => {
  store.init()
})
</script>
