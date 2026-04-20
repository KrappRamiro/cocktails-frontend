/**
 * Reverse-lookup: dado el array de recetas, para cada ingredient_id devuelve
 * qué recetas lo usan (id + nombre).
 *
 * Acepta un getter (fn) o Ref para que la reactividad se propague cuando el
 * array cambia (por ejemplo, al actualizar una receta).
 */

import { computed, unref, type Ref } from 'vue'
import type { CocktailWithAvailability } from '@/types'
import type { IngredientUsage } from '@/components/IngredientToggle.vue'

type Source =
  | Ref<CocktailWithAvailability[]>
  | CocktailWithAvailability[]
  | (() => CocktailWithAvailability[])

export function useIngredientUsage(source: Source) {
  return computed<Record<string, IngredientUsage>>(() => {
    const list: CocktailWithAvailability[] =
      typeof source === 'function' ? source() : unref(source)
    const map: Record<string, IngredientUsage> = {}

    for (const c of list) {
      for (const ing of c.ingredients) {
        if (!map[ing.ingredient_id]) {
          map[ing.ingredient_id] = { count: 0, recipes: [] }
        }
        map[ing.ingredient_id].count += 1
        map[ing.ingredient_id].recipes.push({ id: c.id, name: c.name })
      }
    }

    for (const key of Object.keys(map)) {
      map[key].recipes.sort((a, b) => a.name.localeCompare(b.name))
    }

    return map
  })
}
