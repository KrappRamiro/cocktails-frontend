<template>
  <header
    data-testid="guest-header"
    class="relative overflow-hidden border-b border-border-app/60 bg-surface/70 backdrop-blur-sm"
  >
    <!-- Deco corners -->
    <span aria-hidden class="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-accent/50" />
    <span aria-hidden class="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-accent/50" />

    <div class="mx-auto max-w-5xl px-4 pt-5 pb-4 sm:pt-7 sm:pb-6">
      <!-- Toggles row -->
      <div class="flex items-center justify-end gap-2 mb-3">
        <ModeToggle />
        <ThemeToggle />
      </div>

      <!-- Title block -->
      <div class="text-center">
        <p class="small-caps text-[0.68rem] text-accent/80 mb-1">La Carta</p>
        <h1
          class="font-display font-medium text-fg leading-none"
          style="font-size: clamp(2rem, 6vw, 3rem)"
        >
          {{ eventName }}
        </h1>

        <!-- Ornament rule -->
        <div class="flex items-center justify-center gap-3 mt-3 mb-1 text-accent/70">
          <span class="h-px w-10 bg-gradient-to-r from-transparent to-accent/60" />
          <span class="text-[0.6rem] small-caps">✦</span>
          <span class="h-px w-10 bg-gradient-to-l from-transparent to-accent/60" />
        </div>

        <p v-if="!loading" class="text-sm text-muted font-sans">
          <span data-testid="available-count">{{ stats.available }}</span>
          <span class="small-caps text-[0.7rem] ml-1">
            tragos disponibles este evento
          </span>
        </p>
        <div v-else class="mt-1 h-4 w-56 mx-auto bg-elevated rounded animate-pulse" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Stats } from '@/types'
import ModeToggle from '@/components/theme/ModeToggle.vue'
import ThemeToggle from '@/components/theme/ThemeToggle.vue'

defineProps<{
  eventName: string
  stats: Stats
  loading: boolean
}>()
</script>
