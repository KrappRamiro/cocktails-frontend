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
    <!-- Sides (Collins / highball) -->
    <path d="M16 8 L16 40" />
    <path d="M32 8 L32 40" />
    <!-- Rim -->
    <ellipse cx="24" cy="8" rx="8" ry="1.5" />
    <!-- Base (flat) -->
    <path d="M16 40 Q24 42, 32 40" />
    <!-- Liquid line -->
    <path d="M16 16 Q24 17.5, 32 16" stroke-opacity="0.5" />
    <!-- Straw -->
    <path d="M21 6 L27 38" stroke-opacity="0.5" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 48 })
</script>
