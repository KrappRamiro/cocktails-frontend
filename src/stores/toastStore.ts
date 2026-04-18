/**
 * Pinia store global para notificaciones toast.
 *
 * Usa Pinia en vez de provide/inject para que cualquier store o composable
 * pueda mostrar toasts sin depender del árbol de componentes Vue.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

const MAX_VISIBLE = 3

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function show(message: string, type: ToastType = 'info', duration?: number) {
    const id = nextId++
    const effectiveDuration = duration ?? (type === 'error' ? 5000 : 3000)

    // Si hay demasiados, eliminar el más viejo
    if (toasts.value.length >= MAX_VISIBLE) {
      toasts.value.shift()
    }

    toasts.value.push({ id, message, type })

    setTimeout(() => {
      dismiss(id)
    }, effectiveDuration)
  }

  function dismiss(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return { toasts, show, dismiss }
})
