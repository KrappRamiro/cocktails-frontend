import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Modo = 'invitado' | 'barra'

export const useModoStore = defineStore('modo', () => {
  const modo = ref<Modo>('invitado')

  function setModo(next: Modo) {
    modo.value = next
  }

  function toggle() {
    modo.value = modo.value === 'barra' ? 'invitado' : 'barra'
  }

  return { modo, setModo, toggle }
})
