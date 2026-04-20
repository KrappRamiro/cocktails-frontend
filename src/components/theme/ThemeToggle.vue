<template>
  <button
    type="button"
    :aria-label="`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`"
    :title="`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`"
    class="h-9 w-9 grid place-items-center rounded-full border border-border-app/70 text-accent hover:text-accent-hover hover:border-accent transition-colors"
    @click="toggle"
  >
    <svg
      v-if="theme === 'dark'"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.9 4.9l1.4 1.4" />
      <path d="M17.7 17.7l1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.9 19.1l1.4-1.4" />
      <path d="M17.7 6.3l1.4-1.4" />
    </svg>
    <svg
      v-else
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const store = useThemeStore()
const theme = computed(() => store.theme)

function toggle() {
  store.toggle()
}
</script>
