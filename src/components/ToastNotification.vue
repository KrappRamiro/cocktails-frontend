<template>
  <Teleport to="body">
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:top-4 md:right-4 md:left-auto md:translate-x-0 z-50 flex flex-col gap-2 w-[90vw] max-w-sm">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="[
            'rounded-lg px-4 py-3 shadow-lg flex items-center justify-between text-sm font-medium',
            t.type === 'success' && 'bg-emerald-600 text-white',
            t.type === 'error' && 'bg-red-600 text-white',
            t.type === 'info' && 'bg-sky-600 text-white',
          ]"
          role="alert"
        >
          <span>{{ t.message }}</span>
          <button
            class="ml-3 opacity-70 hover:opacity-100"
            aria-label="Cerrar notificación"
            @click="dismiss(t.id)"
          >
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toastStore'

const store = useToastStore()
const { toasts } = storeToRefs(store)
const { dismiss } = store
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
