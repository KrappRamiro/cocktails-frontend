<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink-900/75 backdrop-blur-sm" @click="$emit('cancel')" />

        <div
          data-testid="confirm-dialog"
          class="relative bg-surface text-fg rounded-deco-lg border border-border-app/70 shadow-deco max-w-sm w-full p-6"
          role="alertdialog"
          aria-modal="true"
          @keydown.escape="$emit('cancel')"
        >
          <span aria-hidden class="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-accent/70" />
          <span aria-hidden class="pointer-events-none absolute right-3 bottom-3 h-4 w-4 border-r border-b border-accent/70" />

          <h2 class="font-display text-xl text-fg">{{ title }}</h2>
          <p class="mt-2 text-sm text-muted">{{ message }}</p>

          <div class="mt-6 flex gap-3 justify-end">
            <button
              data-testid="cancel-button"
              class="px-4 py-2 small-caps text-xs text-muted hover:text-fg border border-border-app/70 rounded-full transition-colors"
              @click="$emit('cancel')"
            >
              Cancelar
            </button>
            <button
              data-testid="confirm-button"
              :class="[
                'px-4 py-2 small-caps text-xs font-medium rounded-full transition-colors',
                confirmStyle === 'danger'
                  ? 'text-bone-50 bg-danger hover:brightness-110'
                  : 'text-ink-900 bg-accent hover:bg-accent-hover',
              ]"
              @click="$emit('confirm')"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    confirmStyle?: 'danger' | 'default'
  }>(),
  { confirmLabel: 'Confirmar', confirmStyle: 'default' },
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
