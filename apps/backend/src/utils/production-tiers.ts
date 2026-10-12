/**
 * Production time by number of boxes in an order. Tiers are sorted by `max`;
 * the last tier has `max: null` and covers everything above. Stored as a JSON
 * string in the store's metadata under `production_tiers`.
 */
export type ProductionTier = {
  max: number | null
  min_days: number
  max_days: number
}

export const PRODUCTION_TIERS_KEY = "production_tiers"

export const DEFAULT_PRODUCTION_TIERS: ProductionTier[] = [
  { max: 2, min_days: 2, max_days: 3 },
  { max: 5, min_days: 4, max_days: 6 },
  { max: null, min_days: 7, max_days: 10 },
]

const isTier = (value: unknown): value is ProductionTier => {
  const tier = value as ProductionTier
  return (
    typeof tier === "object" &&
    tier !== null &&
    (tier.max === null || Number.isInteger(tier.max)) &&
    Number.isInteger(tier.min_days) &&
    Number.isInteger(tier.max_days) &&
    tier.min_days <= tier.max_days
  )
}

/** Parses the metadata value, falling back to the defaults when invalid. */
export const parseProductionTiers = (raw: unknown): ProductionTier[] => {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw

    if (Array.isArray(parsed) && parsed.length && parsed.every(isTier)) {
      return sortTiers(parsed)
    }
  } catch {
    // invalid JSON, use defaults
  }

  return DEFAULT_PRODUCTION_TIERS
}

export const sortTiers = (tiers: ProductionTier[]): ProductionTier[] =>
  [...tiers].sort((a, b) => (a.max ?? Infinity) - (b.max ?? Infinity))

/** Picks the tier for the given number of boxes. */
export const estimateProduction = (
  tiers: ProductionTier[],
  quantity: number
): ProductionTier | null =>
  quantity < 1
    ? null
    : sortTiers(tiers).find((t) => t.max === null || quantity <= t.max) ??
      tiers[tiers.length - 1] ??
      null
