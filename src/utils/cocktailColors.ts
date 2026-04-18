/**
 * Constantes de presentación compartidas para cocktails.
 * Usadas por CocktailCard (guest) y la lista de recetas del admin.
 */

import type { CocktailBase, GlassType } from '@/types'

/** Clases Tailwind por base para badges */
export const baseColorClasses: Record<CocktailBase, string> = {
  gin: 'bg-emerald-700 text-white',
  vodka: 'bg-sky-600 text-white',
  tequila: 'bg-amber-500 text-white',
  ron: 'bg-orange-700 text-white',
  whisky: 'bg-yellow-700 text-white',
  brandy: 'bg-amber-900 text-white',
  pisco: 'bg-violet-600 text-white',
  caipiroska: 'bg-pink-500 text-white',
  caipirinha: 'bg-lime-600 text-white',
  gin_tonics: 'bg-teal-500 text-white',
  mocktail: 'bg-slate-400 text-white',
  espumante: 'bg-yellow-400 text-white',
  licores: 'bg-rose-600 text-white',
}

/** Nombre legible del tipo de vaso */
export const glassLabel: Record<GlassType, string> = {
  copa_martini: 'Copa Martini',
  copa_balon: 'Copa Balón',
  vaso_alto: 'Vaso Alto',
  vaso_bajo: 'Vaso Bajo',
  copa_vino: 'Copa de Vino',
}

/** Nombre legible de la base para tabs y badges */
export const baseLabel: Record<CocktailBase, string> = {
  gin: 'Con Gin',
  vodka: 'Con Vodka',
  tequila: 'Con Tequila',
  ron: 'Con Ron',
  whisky: 'Con Whisky',
  brandy: 'Con Brandy',
  pisco: 'Con Pisco',
  caipiroska: 'Caipiroskas',
  caipirinha: 'Caipirinhas',
  gin_tonics: 'Gin Tonics',
  mocktail: 'Mocktails',
  espumante: 'Con Espumante',
  licores: 'Licores',
}

/** Labels de gustos para los filtros */
export const tasteLabel: Record<string, string> = {
  fresco: 'Frescos',
  frutal: 'Frutales',
  tropical: 'Tropicales',
  clasico: 'Clásicos',
  amargo: 'Amargos',
  sin_alcohol: 'Sin alcohol',
}

/** Orden de categorías de ingredientes para el panel admin */
export const categoryOrder: { key: string; label: string }[] = [
  { key: 'bases_alcoholicas', label: 'Bases alcohólicas' },
  { key: 'vermuts_aperitivos', label: 'Vermuts y aperitivos' },
  { key: 'licores', label: 'Licores' },
  { key: 'amargos', label: 'Amargos (bitters)' },
  { key: 'mixers_gaseosas', label: 'Mixers y gaseosas' },
  { key: 'jugos', label: 'Jugos y néctares' },
  { key: 'frescos_y_botanicos', label: 'Frescos y botánicos' },
  { key: 'basicos_alacena', label: 'Básicos de alacena y siropes' },
  { key: 'decoracion', label: 'Decoración' },
]
