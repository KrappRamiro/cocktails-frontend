// ─── Enums como string literal unions ──────────────────────────────────────
// Deben coincidir exactamente con los valores snake_case que devuelve el backend.

export type CocktailBase = 'gin' | 'vodka' | 'tequila' | 'ron' | 'whisky' | 'brandy' | 'pisco' | 'caipiroska' | 'caipirinha' | 'gin_tonics' | 'mocktail' | 'espumante' | 'licores'

export type CocktailTaste = 'fresco' | 'frutal' | 'tropical' | 'clasico' | 'amargo' | 'sin_alcohol'

export type GlassType = 'copa_martini' | 'copa_balon' | 'vaso_alto' | 'vaso_bajo' | 'copa_vino'

export type IngredientCategory = 'bases_alcoholicas' | 'licores' | 'vermuts_aperitivos' | 'amargos' | 'mixers_gaseosas' | 'jugos' | 'frescos_y_botanicos' | 'basicos_alacena' | 'decoracion'

// ─── Response types ─────────────────────────────────────────────────────────

export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  is_available: boolean
}

export interface CocktailIngredient {
  ingredient_id: string
  name: string
  amount: string
  note: string | null
}

export interface Cocktail {
  id: string
  name: string
  base: CocktailBase
  taste: CocktailTaste[]
  glass: GlassType
  description: string
  ingredients: CocktailIngredient[]
  steps: string[]
  garnish: string
  is_adapted: boolean
  adaptation_note: string | null
  required_ingredients: string[]
}

export interface CocktailWithAvailability extends Cocktail {
  is_available: boolean
}

export interface Stats {
  total: number
  available: number
}

export interface CocktailsResponse {
  cocktails: CocktailWithAvailability[]
  stats: Stats
}

export interface IngredientsResponse {
  ingredients: Ingredient[]
}

// ─── Admin payload types (request bodies) ────────────────────────────────────

export interface IngredientPayload {
  name: string
  category: IngredientCategory
}

export interface IngredientAvailabilityPayload {
  available: boolean
}

export interface CocktailIngredientPayload {
  ingredient_id: string
  amount: string
  note: string | null
}

export interface CocktailPayload {
  name: string
  base: CocktailBase
  taste: CocktailTaste[]
  glass: GlassType
  description: string
  ingredients: CocktailIngredientPayload[]
  steps: string[]
  garnish: string
  is_adapted: boolean
  adaptation_note: string | null
  required_ingredients: string[]
}

// ─── API client types ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public url: string,
  ) {
    super(`API Error ${status}: ${body}`)
    this.name = 'ApiError'
  }
}
