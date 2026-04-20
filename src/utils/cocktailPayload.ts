import type { CocktailWithAvailability, CocktailPayload } from '@/types'

/**
 * Convierte un `CocktailWithAvailability` (shape recibido del backend) en un
 * `CocktailPayload` (shape que espera el endpoint de create/update).
 *
 * Útil para clonar una receta: tomás los datos de una existente, los pasás
 * como `initialPayload` al editor, cambiás lo que quieras, y el submit usa
 * el mismo endpoint de create.
 */
export function cocktailToCocktailPayload(c: CocktailWithAvailability): CocktailPayload {
  return {
    name: c.name,
    base: c.base,
    taste: [...c.taste],
    glass: c.glass,
    description: c.description,
    ingredients: c.ingredients.map((i) => ({
      ingredient_id: i.ingredient_id,
      amount: i.amount,
      note: i.note,
    })),
    steps: [...c.steps],
    garnish: c.garnish,
    is_adapted: c.is_adapted,
    adaptation_note: c.adaptation_note,
    required_ingredients: [...c.required_ingredients],
  }
}
