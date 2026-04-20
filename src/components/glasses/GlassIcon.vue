<template>
  <component :is="glassMap[glass]" :size="size" />
</template>

<script setup lang="ts">
import type { GlassType } from '@/types'
import CopaMartini from './CopaMartini.vue'
import CopaBalon from './CopaBalon.vue'
import VasoAlto from './VasoAlto.vue'
import VasoBajo from './VasoBajo.vue'
import CopaVino from './CopaVino.vue'

withDefaults(
  defineProps<{
    glass: GlassType
    size?: number | string
  }>(),
  { size: 48 },
)

const glassMap = {
  copa_martini: CopaMartini,
  copa_balon: CopaBalon,
  vaso_alto: VasoAlto,
  vaso_bajo: VasoBajo,
  copa_vino: CopaVino,
} as const
</script>
