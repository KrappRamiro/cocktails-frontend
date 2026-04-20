/**
 * Normaliza un string para comparación insensible a mayúsculas y diacríticos.
 * Útil para búsquedas donde "Caipiroska" debe matchear "caipirosa", "CAIPIROSKA",
 * "cãipirôska", etc.
 */
export function normalizeForSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** Retorna `true` si `haystack` contiene a `needle` (ambos normalizados). */
export function matchesSearch(haystack: string, needle: string): boolean {
  if (!needle) return true
  return normalizeForSearch(haystack).includes(normalizeForSearch(needle))
}
