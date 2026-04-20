<template>
  <div class="min-h-screen bg-base text-fg flex">
    <AdminSidebar
      :active-tab="activeTab"
      :event-name="eventName"
      @select="(t) => $emit('select', t)"
      @logout="$emit('logout')"
    />

    <div class="flex-1 min-w-0 flex flex-col">
      <!-- Mobile top bar -->
      <header class="md:hidden flex items-center justify-between px-4 py-4 border-b border-border-app/60 bg-surface/70 backdrop-blur-sm">
        <div class="min-w-0">
          <p class="small-caps text-[0.6rem] text-accent/80">Evento</p>
          <p class="font-display text-fg text-lg leading-tight truncate" :title="eventName">
            {{ eventName }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <button
            data-testid="logout-button"
            aria-label="Cerrar sesión"
            class="h-9 w-9 grid place-items-center rounded-full border border-border-app/70 text-muted hover:text-danger hover:border-danger transition-colors"
            @click="$emit('logout')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Sync indicator -->
      <div
        v-if="syncStatus === 'saving'"
        data-testid="sync-status"
        class="bg-accent/10 text-accent small-caps text-[0.7rem] text-center py-1.5 border-b border-accent/30"
      >
        Guardando...
      </div>
      <div
        v-else-if="syncStatus === 'saved'"
        data-testid="sync-status"
        class="bg-accent/15 text-accent small-caps text-[0.7rem] text-center py-1.5 border-b border-accent/40"
      >
        Guardado
      </div>

      <!-- Content -->
      <main class="flex-1 p-4 md:p-6 pb-24 md:pb-8">
        <slot />
      </main>

      <!-- Desktop-only theme toggle (floating) -->
      <div class="hidden md:block fixed bottom-5 right-5 z-20">
        <ThemeToggle />
      </div>

      <AdminBottomNav :active-tab="activeTab" @select="(t) => $emit('select', t)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SyncStatus } from '@/stores/adminStore'
import AdminSidebar from './AdminSidebar.vue'
import AdminBottomNav from './AdminBottomNav.vue'
import ThemeToggle from '@/components/theme/ThemeToggle.vue'
import type { AdminTabKey } from './adminTabs'

defineProps<{
  activeTab: AdminTabKey
  eventName: string
  syncStatus: SyncStatus
}>()

defineEmits<{
  select: [tab: AdminTabKey]
  logout: []
}>()
</script>
