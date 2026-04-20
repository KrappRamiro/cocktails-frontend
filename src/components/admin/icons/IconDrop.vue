<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3 C 8 9, 6 12, 6 15.5 a 6 6 0 0 0 12 0 C 18 12, 16 9, 12 3 z" />
    <path d="M9 14.5 c 0.5 1.5, 2 2.5, 3 2.5" stroke-opacity="0.55" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 20 })
</script>
