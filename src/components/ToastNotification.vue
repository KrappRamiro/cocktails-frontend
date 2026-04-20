<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:top-4 md:right-4 md:left-auto md:translate-x-0 z-50 flex flex-col gap-2 w-[90vw] max-w-sm"
      style="bottom: calc(env(safe-area-inset-bottom) + 1rem)"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          role="alert"
          :class="[
            'pointer-events-auto rounded-deco px-4 py-3 shadow-deco-sm border flex items-center justify-between text-sm backdrop-blur-sm',
            t.type === 'success' && 'bg-accent/15 border-accent/50 text-accent',
            t.type === 'error' && 'bg-danger/15 border-danger/60 text-danger',
            t.type === 'info' && 'bg-elevated/80 border-border-app/70 text-fg',
          ]"
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
