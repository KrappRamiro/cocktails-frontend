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
    <!-- Bowl (tulip-shaped) -->
    <path d="M15 10 Q14 24, 24 26 Q34 24, 33 10" />
    <!-- Rim -->
    <path d="M15 10 L33 10" />
    <!-- Stem -->
    <path d="M24 26 L24 40" />
    <!-- Base -->
    <path d="M17 40 L31 40" />
    <!-- Liquid line -->
    <path d="M16 18 Q17.5 22, 24 22.5 Q30.5 22, 32 18" stroke-opacity="0.45" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 48 })
</script>
