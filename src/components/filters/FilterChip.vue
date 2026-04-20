<template>
  <button
    type="button"
    role="tab"
    :aria-selected="active"
    :class="[
      'whitespace-nowrap rounded-full px-4 h-10 text-xs small-caps font-medium transition-all min-h-[40px]',
      'border',
      active
        ? 'border-accent text-accent bg-accent/5 shadow-deco-sm'
        : 'border-border-app/60 text-muted hover:text-fg hover:border-accent/60',
    ]"
    @click="$emit('select')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ active: boolean }>()
defineEmits<{ select: [] }>()
</script>
