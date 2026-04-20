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
    <path d="M4 5 a 2 2 0 0 1 2 -2 h 12 a 2 2 0 0 1 2 2 v 14 a 2 2 0 0 1 -2 2 H 6 a 2 2 0 0 1 -2 -2 z" />
    <path d="M8 3 v 18" stroke-opacity="0.65" />
    <path d="M11 8 h 5" stroke-opacity="0.6" />
    <path d="M11 12 h 5" stroke-opacity="0.6" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 20 })
</script>
