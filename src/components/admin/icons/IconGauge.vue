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
    <path d="M3 15 a 9 9 0 0 1 18 0" />
    <path d="M12 15 L 17 10" />
    <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" />
    <path d="M5.2 13 h 1.4" stroke-opacity="0.5" />
    <path d="M17.4 13 h 1.4" stroke-opacity="0.5" />
    <path d="M7.2 9.2 l 0.8 1" stroke-opacity="0.5" />
    <path d="M16 9.2 l -0.8 1" stroke-opacity="0.5" />
    <path d="M11.3 6.5 l 0 1.2" stroke-opacity="0.5" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number | string }>(), { size: 20 })
</script>
