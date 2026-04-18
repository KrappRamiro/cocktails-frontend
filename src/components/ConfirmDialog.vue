<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="$emit('cancel')" />

        <!-- Dialog -->
        <div
          data-testid="confirm-dialog"
          class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
          role="alertdialog"
          aria-modal="true"
          @keydown.escape="$emit('cancel')"
        >
          <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ message }}</p>

          <div class="mt-6 flex gap-3 justify-end">
            <button
              data-testid="cancel-button"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              @click="$emit('cancel')"
            >
              Cancelar
            </button>
            <button
              data-testid="confirm-button"
              :class="[
                'px-4 py-2 text-sm font-medium text-white rounded-lg',
                confirmStyle === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-sky-600 hover:bg-sky-700',
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
