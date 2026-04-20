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
    <!-- Sides (rocks / old-fashioned) -->
    <path d="M12 16 L12 38" />
    <path d="M36 16 L36 38" />
    <!-- Rim -->
    <ellipse cx="24" cy="16" rx="12" ry="2" />
    <!-- Base -->
    <path d="M12 38 Q24 40, 36 38" />
    <!-- Liquid fill (generous — it's rocks) -->
    <path d="M12 26 Q24 27.5, 36 26" stroke-opacity="0.5" />
    <!-- Single ice cube hint -->
    <path d="M19 21 L27 21 L27 29 L19 29 Z" stroke-opacity="0.35" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 48 })
</script>
