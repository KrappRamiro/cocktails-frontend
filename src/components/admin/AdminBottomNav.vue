<template>
  <nav
    class="fixed md:hidden bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border-app/70"
    style="padding-bottom: env(safe-area-inset-bottom)"
  >
    <div class="flex justify-around">
      <button
        v-for="tab in adminTabs"
        :key="tab.key"
        :data-testid="tab.testId"
        :aria-current="activeTab === tab.key ? 'page' : undefined"
        :class="[
          'flex-1 flex flex-col items-center justify-center py-2 text-[0.6rem] small-caps min-h-[56px] gap-1',
          activeTab === tab.key ? 'text-accent' : 'text-muted hover:text-fg',
        ]"
        @click="$emit('select', tab.key)"
      >
        <component :is="tab.icon" :size="22" />
        <span>{{ tab.label }}</span>
        <span
          v-if="activeTab === tab.key"
          aria-hidden
          class="h-0.5 w-6 rounded-full bg-accent mt-0.5"
        />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { adminTabs, type AdminTabKey } from './adminTabs'

defineProps<{ activeTab: AdminTabKey }>()
defineEmits<{ select: [tab: AdminTabKey] }>()
</script>
