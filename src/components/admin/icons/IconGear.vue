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
    <circle cx="12" cy="12" r="3" />
    <path
      d="M19.4 15 a 1.65 1.65 0 0 0 0.33 1.82 l 0.06 0.06 a 2 2 0 1 1 -2.83 2.83 l -0.06 -0.06 a 1.65 1.65 0 0 0 -1.82 -0.33 1.65 1.65 0 0 0 -1 1.51 V 21 a 2 2 0 0 1 -4 0 v -0.09 a 1.65 1.65 0 0 0 -1 -1.51 1.65 1.65 0 0 0 -1.82 0.33 l -0.06 0.06 a 2 2 0 1 1 -2.83 -2.83 l 0.06 -0.06 a 1.65 1.65 0 0 0 0.33 -1.82 1.65 1.65 0 0 0 -1.51 -1 H 3 a 2 2 0 0 1 0 -4 h 0.09 a 1.65 1.65 0 0 0 1.51 -1 1.65 1.65 0 0 0 -0.33 -1.82 l -0.06 -0.06 a 2 2 0 1 1 2.83 -2.83 l 0.06 0.06 a 1.65 1.65 0 0 0 1.82 0.33 h 0 a 1.65 1.65 0 0 0 1 -1.51 V 3 a 2 2 0 0 1 4 0 v 0.09 a 1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82 -0.33 l 0.06 -0.06 a 2 2 0 1 1 2.83 2.83 l -0.06 0.06 a 1.65 1.65 0 0 0 -0.33 1.82 v 0 a 1.65 1.65 0 0 0 1.51 1 H 21 a 2 2 0 0 1 0 4 h -0.09 a 1.65 1.65 0 0 0 -1.51 1 z"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 20 })
</script>
