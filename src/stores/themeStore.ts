import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  applyThemeClass,
  getInitialTheme,
  persistTheme,
  type Theme,
} from '@/utils/applyInitialTheme'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(getInitialTheme())

  function setTheme(next: Theme) {
    theme.value = next
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(
    theme,
    (next) => {
      applyThemeClass(next)
      persistTheme(next)
    },
    { immediate: true },
  )

  return { theme, setTheme, toggle }
})
