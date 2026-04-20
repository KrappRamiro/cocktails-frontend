<template>
  <aside
    class="hidden md:flex flex-col shrink-0 w-56 min-h-screen bg-surface/60 border-r border-border-app/60 px-3 py-5"
  >
    <!-- Brand -->
    <div class="px-2 pb-4 border-b border-border-app/60">
      <p class="small-caps text-[0.65rem] text-accent/80">Evento</p>
      <p class="font-display text-fg text-lg leading-tight mt-0.5 truncate" :title="eventName">
        {{ eventName }}
      </p>
      <p class="small-caps text-[0.6rem] text-muted mt-0.5">Panel</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 pt-4 space-y-1">
      <button
        v-for="tab in adminTabs"
        :key="tab.key"
        :data-testid="tab.testId"
        :aria-current="activeTab === tab.key ? 'page' : undefined"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-deco text-sm transition-colors',
          activeTab === tab.key
            ? 'bg-accent/10 text-accent border border-accent/40 shadow-deco-sm'
            : 'text-muted border border-transparent hover:text-fg hover:bg-elevated/50',
        ]"
        @click="$emit('select', tab.key)"
      >
        <component :is="tab.icon" :size="18" />
        <span class="small-caps tracking-wide">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Footer -->
    <div class="pt-3 border-t border-border-app/60">
      <button
        data-testid="logout-button"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-deco text-xs small-caps text-muted hover:text-danger transition-colors"
        @click="$emit('logout')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { adminTabs, type AdminTabKey } from './adminTabs'

defineProps<{
  activeTab: AdminTabKey
  eventName: string
}>()

defineEmits<{
  select: [tab: AdminTabKey]
  logout: []
}>()
</script>
