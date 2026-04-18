import { describe, it, expect } from 'vitest'
import { baseColorClasses, glassLabel, baseLabel, tasteLabel, categoryOrder } from '@/utils/cocktailColors'
import type { CocktailBase, GlassType } from '@/types'

const ALL_BASES: CocktailBase[] = ['gin', 'vodka', 'tequila', 'ron', 'whisky', 'brandy', 'pisco', 'caipiroska', 'caipirinha', 'gin_tonics', 'mocktail', 'espumante', 'licores']
const ALL_GLASSES: GlassType[] = ['copa_martini', 'copa_balon', 'vaso_alto', 'vaso_bajo', 'copa_vino']
const ALL_TASTES = ['fresco', 'frutal', 'tropical', 'clasico', 'amargo', 'sin_alcohol']

describe('cocktailColors', () => {
  describe('baseColorClasses', () => {
    it.each(ALL_BASES)('has an entry for base "%s"', (base) => {
      expect(baseColorClasses[base]).toBeDefined()
    })

    it('has no extra keys beyond known bases', () => {
      expect(Object.keys(baseColorClasses).sort()).toEqual([...ALL_BASES].sort())
    })

    it.each(ALL_BASES)('value for "%s" contains bg- and text-white', (base) => {
      expect(baseColorClasses[base]).toMatch(/bg-\w+-\d+/)
      expect(baseColorClasses[base]).toContain('text-white')
    })
  })

  describe('glassLabel', () => {
    it.each(ALL_GLASSES)('has a non-empty label for glass "%s"', (glass) => {
      expect(glassLabel[glass]).toBeTruthy()
      expect(typeof glassLabel[glass]).toBe('string')
    })

    it('has no extra keys', () => {
      expect(Object.keys(glassLabel).sort()).toEqual([...ALL_GLASSES].sort())
    })
  })

  describe('baseLabel', () => {
    it.each(ALL_BASES)('has a non-empty label for base "%s"', (base) => {
      expect(baseLabel[base]).toBeTruthy()
    })

    it('keys match baseColorClasses keys (no drift)', () => {
      expect(Object.keys(baseLabel).sort()).toEqual(Object.keys(baseColorClasses).sort())
    })
  })

  describe('tasteLabel', () => {
    it.each(ALL_TASTES)('has a non-empty label for taste "%s"', (taste) => {
      expect(tasteLabel[taste]).toBeTruthy()
    })
  })

  describe('categoryOrder', () => {
    it('has 9 entries', () => {
      expect(categoryOrder).toHaveLength(9)
    })

    it('each entry has non-empty key and label', () => {
      for (const cat of categoryOrder) {
        expect(cat.key).toBeTruthy()
        expect(cat.label).toBeTruthy()
      }
    })

    it('all keys are unique', () => {
      const keys = categoryOrder.map((c) => c.key)
      expect(new Set(keys).size).toBe(keys.length)
    })

    it('starts with bases_alcoholicas and ends with decoracion', () => {
      expect(categoryOrder[0].key).toBe('bases_alcoholicas')
      expect(categoryOrder[8].key).toBe('decoracion')
    })
  })
})
