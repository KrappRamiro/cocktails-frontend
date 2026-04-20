<template>
  <!-- Login -->
  <div
    v-if="!store.isAuthenticated"
    class="min-h-screen flex items-center justify-center px-4 bg-base text-fg"
  >
    <form
      data-testid="login-form"
      class="relative bg-surface rounded-deco-lg border border-border-app/70 shadow-deco p-8 w-full max-w-sm space-y-5"
      @submit.prevent="handleLogin"
    >
      <span aria-hidden class="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-accent/70" />
      <span aria-hidden class="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-accent/70" />
      <span aria-hidden class="pointer-events-none absolute left-3 bottom-3 h-4 w-4 border-l border-b border-accent/70" />
      <span aria-hidden class="pointer-events-none absolute right-3 bottom-3 h-4 w-4 border-r border-b border-accent/70" />

      <div class="text-center">
        <p class="small-caps text-[0.65rem] text-accent/80">Panel privado</p>
        <h1 class="font-display text-2xl text-fg mt-1">Ingreso</h1>
      </div>

      <div>
        <label for="user" class="block small-caps text-[0.62rem] text-muted mb-1">Usuario</label>
        <input
          id="user"
          data-testid="login-user"
          v-model="loginUser"
          type="text"
          required
          autocomplete="username"
          class="w-full rounded-md bg-base border-border-app/70"
        />
      </div>

      <div>
        <label for="pass" class="block small-caps text-[0.62rem] text-muted mb-1">Contraseña</label>
        <input
          id="pass"
          data-testid="login-pass"
          v-model="loginPass"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-md bg-base border-border-app/70"
        />
      </div>

      <button
        type="submit"
        data-testid="login-submit"
        :disabled="loginLoading"
        class="w-full py-2.5 small-caps text-xs font-medium text-ink-900 bg-accent rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {{ loginLoading ? 'Ingresando...' : 'Ingresar' }}
      </button>

      <div class="text-center pt-2">
        <a href="/" class="small-caps text-[0.6rem] text-muted hover:text-accent transition-colors">
          ← volver al menú público
        </a>
      </div>
    </form>
  </div>

  <!-- Authenticated panel -->
  <AdminShell
    v-else
    :active-tab="activeTab"
    :event-name="configStore.eventName"
    :sync-status="store.syncStatus"
    @select="(t) => (activeTab = t)"
    @logout="store.logout()"
  >
    <!-- Ingredientes ─────────────────────────────────────────────────────── -->
    <section v-if="activeTab === 'ingredients'" class="max-w-3xl mx-auto space-y-6">
      <header class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="font-display text-3xl text-fg">Ingredientes</h2>
          <p class="small-caps text-[0.65rem] text-muted mt-1">
            tocá el nombre para ver en qué recetas se usa
          </p>
        </div>
        <button
          data-testid="new-ingredient-button"
          class="small-caps text-xs text-accent border border-accent/50 rounded-full px-4 py-2 hover:bg-accent/10 transition-colors"
          @click="showIngredientForm = !showIngredientForm"
        >
          + Nuevo
        </button>
      </header>

      <input
        v-model="ingredientSearch"
        data-testid="ingredient-search"
        type="search"
        placeholder="Buscar ingrediente..."
        class="w-full rounded-full bg-surface border-border-app/70 text-sm px-4 py-2.5"
      />

      <IngredientForm
        v-if="showIngredientForm"
        :ingredient="null"
        @save="handleCreateIngredient"
        @cancel="showIngredientForm = false"
      />

      <div v-for="cat in filteredIngredientsByCategory" :key="cat.key">
        <div v-if="cat.items.length > 0" class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="small-caps text-sm text-accent/85 tracking-[0.18em]">
              {{ cat.label }}
            </h3>
            <button
              class="small-caps text-[0.6rem] text-muted hover:text-accent transition-colors"
              @click="toggleAllInCategory(cat.key, cat.items)"
            >
              {{ allAvailableInCategory(cat.items) ? 'Desmarcar todos' : 'Marcar todos' }}
            </button>
          </div>

          <div class="space-y-1.5">
            <template v-for="ing in cat.items" :key="ing.id">
              <IngredientToggle
                :ingredient="ing"
                :usage="usageMap[ing.id]"
                @toggle="store.toggleIngredient(ing.id)"
                @edit="editingIngredientId = editingIngredientId === ing.id ? null : ing.id"
                @delete="confirmDeleteIngredient(ing)"
                @openRecipe="openEditorById"
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
    </section>

    <!-- Recetas ──────────────────────────────────────────────────────────── -->
    <section v-if="activeTab === 'recipes'" class="max-w-3xl mx-auto space-y-5">
      <header class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="font-display text-3xl text-fg">Recetas</h2>
          <p class="small-caps text-[0.65rem] text-muted mt-1">
            {{ store.cocktails.length }} en total
          </p>
        </div>
        <button
          data-testid="new-recipe-button"
          class="small-caps text-xs font-medium text-ink-900 bg-accent rounded-full px-4 py-2 hover:bg-accent-hover transition-colors"
          @click="openEditor(null)"
        >
          + Nueva receta
        </button>
      </header>

      <input
        v-model="recipeSearch"
        data-testid="recipe-search"
        type="search"
        placeholder="Buscar receta..."
        class="w-full rounded-full bg-surface border-border-app/70 text-sm px-4 py-2.5"
      />

      <div class="space-y-2">
        <RecipeListRow
          v-for="c in sortedCocktails"
          :key="c.id"
          :cocktail="c"
          @edit="openEditor(c)"
          @clone="openEditorForClone(c)"
          @remove="confirmDeleteCocktail(c)"
        />
      </div>
    </section>

    <!-- Dashboard ────────────────────────────────────────────────────────── -->
    <section v-if="activeTab === 'dashboard'" class="max-w-4xl mx-auto">
      <header class="mb-6">
        <h2 class="font-display text-3xl text-fg">La Barra</h2>
        <p class="small-caps text-[0.65rem] text-muted mt-1">inventario y qué podés servir</p>
      </header>

      <DashboardPanel
        :cocktails="store.cocktails"
        :ingredients="store.ingredients"
        :stats="{ total: store.availabilityStats.total, available: store.availabilityStats.available }"
        :by-base="store.availabilityStats.byBase"
        @activateIngredient="handleActivateIngredient"
      />
    </section>

    <!-- Settings ─────────────────────────────────────────────────────────── -->
    <section v-if="activeTab === 'settings'" class="max-w-2xl mx-auto">
      <header class="mb-6">
        <h2 class="font-display text-3xl text-fg">Ajustes</h2>
        <p class="small-caps text-[0.65rem] text-muted mt-1">configuración del evento</p>
      </header>

      <SettingsPanel :auth-token="store.authToken" />
    </section>

    <!-- Cocktail editor — key forces remount on edit/clone/new switch -->
    <CocktailEditor
      v-if="editorOpen"
      :key="editorKey"
      :cocktail="editorCocktail"
      :all-ingredients="store.ingredients"
      :initial-payload="editorInitialPayload"
      :mode="editorMode"
      @save="handleSaveCocktail"
      @cancel="closeEditor"
      @clone="cloneFromEditor"
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
  </AdminShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useConfigStore } from '@/stores/configStore'
import { useTheme } from '@/composables/useTheme'
import { useIngredientUsage } from '@/composables/useIngredientUsage'
import { matchesSearch } from '@/utils/normalize'
import { cocktailToCocktailPayload } from '@/utils/cocktailPayload'
import type {
  Ingredient,
  CocktailWithAvailability,
  CocktailPayload,
  IngredientPayload,
} from '@/types'

import IngredientToggle from '@/components/IngredientToggle.vue'
import IngredientForm from '@/components/IngredientForm.vue'
import CocktailEditor from '@/components/CocktailEditor.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import RecipeListRow from '@/components/admin/RecipeListRow.vue'
import DashboardPanel from '@/components/admin/DashboardPanel.vue'
import SettingsPanel from '@/components/admin/SettingsPanel.vue'
import type { AdminTabKey } from '@/components/admin/adminTabs'

const store = useAdminStore()
const configStore = useConfigStore()

useTheme()

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
const activeTab = ref<AdminTabKey>('ingredients')

// ─── Ingredients ───────────────────────────────────────────────────────────
const showIngredientForm = ref(false)
const editingIngredientId = ref<string | null>(null)
const ingredientSearch = ref('')

const filteredIngredientsByCategory = computed(() => {
  const q = ingredientSearch.value
  if (!q.trim()) return store.ingredientsByCategory
  return store.ingredientsByCategory.map((cat) => ({
    ...cat,
    items: cat.items.filter((i) => matchesSearch(i.name, q)),
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
const editorInitialPayload = ref<CocktailPayload | null>(null)
const editorMode = ref<'edit' | 'clone' | 'new'>('new')
const editorKey = ref(0)
const recipeSearch = ref('')

const sortedCocktails = computed(() => {
  const sorted = [...store.cocktails].sort(
    (a, b) => a.base.localeCompare(b.base) || a.name.localeCompare(b.name),
  )
  const q = recipeSearch.value
  if (!q.trim()) return sorted
  return sorted.filter((c) => matchesSearch(c.name, q))
})

// Reverse lookup: ingredient_id → list of recipes using it (reactive getter)
const usageMap = useIngredientUsage(() => store.cocktails)

function openEditor(cocktail: CocktailWithAvailability | null) {
  editorCocktail.value = cocktail
  editorInitialPayload.value = null
  editorMode.value = cocktail ? 'edit' : 'new'
  editorKey.value += 1
  editorOpen.value = true
}

function openEditorById(cocktailId: string) {
  const c = store.cocktails.find((x) => x.id === cocktailId)
  if (c) openEditor(c)
}

function openEditorForClone(cocktail: CocktailWithAvailability) {
  const payload = cocktailToCocktailPayload(cocktail)
  payload.name = `Copia de ${cocktail.name}`
  editorCocktail.value = null
  editorInitialPayload.value = payload
  editorMode.value = 'clone'
  editorKey.value += 1
  editorOpen.value = true
}

function cloneFromEditor() {
  if (!editorCocktail.value) return
  openEditorForClone(editorCocktail.value)
}

function closeEditor() {
  editorOpen.value = false
  editorCocktail.value = null
  editorInitialPayload.value = null
}

async function handleSaveCocktail(payload: CocktailPayload) {
  if (editorCocktail.value) {
    await store.updateCocktail(editorCocktail.value.id, payload)
  } else {
    await store.createCocktail(payload)
  }
  closeEditor()
}

// Dashboard action — turn on the ingredient so the cocktail becomes servable
async function handleActivateIngredient(ingredientId: string) {
  const ing = store.ingredients.find((i) => i.id === ingredientId)
  if (!ing || ing.is_available) return
  await store.toggleIngredient(ingredientId)
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
  configStore.loadConfig()
})
</script>
