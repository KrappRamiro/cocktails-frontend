<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    stroke-width="1.25"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Bowl (big round goblet) -->
    <path d="M13 14 Q13 30, 24 30 Q35 30, 35 14" />
    <!-- Rim (slight ellipse) -->
    <ellipse cx="24" cy="14" rx="11" ry="2.5" />
    <!-- Stem -->
    <path d="M24 30 L24 40" />
    <!-- Base -->
    <path d="M16 40 L32 40" />
    <!-- Liquid -->
    <path d="M14.5 18 Q15 28, 24 28 Q33 28, 33.5 18" stroke-opacity="0.4" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 48 })
</script>
