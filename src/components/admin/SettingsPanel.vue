<template>
  <div class="max-w-xl space-y-6">
    <section class="bg-surface border border-border-app/70 rounded-deco p-5">
      <h3 class="font-display text-xl text-fg mb-1">Nombre del evento</h3>
      <p class="small-caps text-[0.65rem] text-muted mb-4">
        se muestra como título del menú público
      </p>

      <form class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end" @submit.prevent="save">
        <label class="flex-1">
          <span class="sr-only">Nombre del evento</span>
          <input
            v-model="eventNameDraft"
            type="text"
            maxlength="80"
            required
            class="w-full rounded-md border-border-app/70 bg-base text-sm"
            placeholder="Cumpleaños Rami"
          />
        </label>
        <button
          type="submit"
          :disabled="!canSave || saving"
          class="shrink-0 px-5 py-2 small-caps text-xs font-medium text-ink-900 bg-accent rounded-full hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
      </form>

      <p v-if="message" class="mt-3 small-caps text-[0.65rem]" :class="messageType === 'error' ? 'text-danger' : 'text-accent'">
        {{ message }}
      </p>
    </section>

    <section class="bg-surface border border-border-app/70 rounded-deco p-5">
      <h3 class="font-display text-xl text-fg mb-1">Tema</h3>
      <p class="small-caps text-[0.65rem] text-muted mb-4">
        cambiar entre modo oscuro (speakeasy) y claro
      </p>

      <div class="flex gap-2">
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-full small-caps text-xs border transition-colors',
            themeStore.theme === 'dark'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border-app/60 text-muted hover:text-fg',
          ]"
          @click="themeStore.setTheme('dark')"
        >
          Oscuro
        </button>
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-full small-caps text-xs border transition-colors',
            themeStore.theme === 'light'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border-app/60 text-muted hover:text-fg',
          ]"
          @click="themeStore.setTheme('light')"
        >
          Claro
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useThemeStore } from '@/stores/themeStore'

const props = defineProps<{ authToken: string | null }>()

const configStore = useConfigStore()
const themeStore = useThemeStore()

const eventNameDraft = ref(configStore.eventName)
const saving = ref(false)
const message = ref<string | null>(null)
const messageType = ref<'ok' | 'error'>('ok')

watch(
  () => configStore.eventName,
  (next) => {
    eventNameDraft.value = next
  },
)

const canSave = computed(() => {
  const trimmed = eventNameDraft.value.trim()
  return trimmed.length > 0 && trimmed.length <= 80 && trimmed !== configStore.eventName
})

async function save() {
  if (!canSave.value) return
  saving.value = true
  message.value = null

  const result = await configStore.updateEventName(eventNameDraft.value.trim(), props.authToken)
  saving.value = false

  if (result.ok) {
    message.value = 'Nombre actualizado'
    messageType.value = 'ok'
    setTimeout(() => {
      if (message.value === 'Nombre actualizado') message.value = null
    }, 2500)
  } else {
    message.value = result.message ?? 'No se pudo guardar'
    messageType.value = 'error'
  }
}
</script>
