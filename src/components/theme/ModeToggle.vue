<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modo === 'barra'"
    :aria-label="`Modo ${modo === 'barra' ? 'barra (activo)' : 'invitado'}`"
    class="group flex items-center gap-3 rounded-full border border-border-app/70 pl-3 pr-1 py-1 transition-colors hover:border-accent"
    @click="toggle"
  >
    <span
      class="small-caps text-[0.7rem] leading-none text-muted group-hover:text-fg transition-colors"
    >
      {{ modo === 'barra' ? 'Modo barra' : 'Modo invitado' }}
    </span>
    <span
      class="relative inline-flex shrink-0 h-6 w-11 rounded-full transition-colors"
      :class="modo === 'barra' ? 'bg-accent/85' : 'bg-elevated'"
    >
      <span
        class="absolute left-0 top-0.5 inline-block h-5 w-5 rounded-full bg-bone-50 shadow-deco-sm transition-transform"
        :class="modo === 'barra' ? 'translate-x-5' : 'translate-x-0.5'"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import { useModoBarra } from '@/composables/useModoBarra'

const { modo, toggle } = useModoBarra()
</script>
