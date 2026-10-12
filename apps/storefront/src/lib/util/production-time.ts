export type ProductionTier = {
  max: number | null
  min_days: number
  max_days: number
}

export type ProductionEstimate = {
  quantity: number
  minDays: number
  maxDays: number
}

/** Picks the tier for the given number of boxes (tiers are sorted by max). */
export const estimateProduction = (
  tiers: ProductionTier[],
  quantity: number
): ProductionEstimate | null => {
  if (!tiers.length || quantity < 1) {
    return null
  }

  const tier =
    tiers.find((t) => t.max === null || quantity <= t.max) ??
    tiers[tiers.length - 1]

  return { quantity, minDays: tier.min_days, maxDays: tier.max_days }
}

/** Total number of boxes in a cart or order. */
export const countItems = (
  items?: { quantity?: number | null }[] | null
): number => (items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0)
