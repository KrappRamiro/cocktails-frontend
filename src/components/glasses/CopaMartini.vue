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
    <!-- Rim -->
    <path d="M8 10 L40 10" />
    <!-- Bowl (V-shape) -->
    <path d="M8 10 L24 28 L40 10" />
    <!-- Stem -->
    <path d="M24 28 L24 40" />
    <!-- Base -->
    <path d="M16 40 L32 40" />
    <!-- Liquid line -->
    <path d="M12 14 L36 14" stroke-opacity="0.5" />
    <!-- Olive / garnish -->
    <circle cx="28" cy="14" r="1.5" fill="currentColor" fill-opacity="0.35" stroke="none" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 48 })
</script>
