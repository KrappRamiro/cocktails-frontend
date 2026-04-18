/**
 * Shared test data factories.
 * Each factory returns a valid object with sensible defaults.
 * Pass overrides to customize specific fields.
 */

import type { Ingredient, CocktailWithAvailability, CocktailIngredient, Stats } from '@/types'

export function makeIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: 'ing-uuid-001',
    name: 'Gin (seco/dry)',
    category: 'bases_alcoholicas',
    is_available: true,
    ...overrides,
  }
}

export function makeCocktailIngredient(overrides: Partial<CocktailIngredient> = {}): CocktailIngredient {
  return {
    ingredient_id: 'ing-uuid-001',
    name: 'Gin (seco/dry)',
    amount: '50ml',
    note: null,
    ...overrides,
  }
}

export function makeCocktail(overrides: Partial<CocktailWithAvailability> = {}): CocktailWithAvailability {
  return {
    id: 'cocktail-uuid-001',
    name: 'Martini Clásico',
    base: 'gin',
    taste: ['clasico'],
    glass: 'copa_martini',
    description: 'El clásico eterno.',
    ingredients: [
      makeCocktailIngredient(),
      makeCocktailIngredient({ ingredient_id: 'ing-uuid-002', name: 'Martini Extra Dry', amount: '10ml' }),
    ],
    steps: ['Enfriar copa con hielo.', 'Agregar gin, remover 15 seg.'],
    garnish: 'Twist de piel de limón',
    is_adapted: false,
    adaptation_note: null,
    required_ingredients: ['ing-uuid-001', 'ing-uuid-002'],
    is_available: true,
    ...overrides,
  }
}

export function makeStats(overrides: Partial<Stats> = {}): Stats {
  return {
    total: 45,
    available: 12,
    ...overrides,
  }
}
