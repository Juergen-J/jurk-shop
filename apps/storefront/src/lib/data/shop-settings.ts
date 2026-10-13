import { sdk } from "@lib/config"
import { ProductionTier } from "@lib/util/production-time"

export type ShopSettings = {
  small_business: boolean
  shipping_options: { name: string; amount: number | null }[]
  production_tiers: ProductionTier[]
  bank: { holder: string; iban: string; bic: string; name: string }
  /** The invoice comes separately (Lexware); pay with the invoice number. */
  invoice_separately: boolean
  free_shipping_threshold: number | null
  volume_discounts: { min_total: number; percent: number }[]
}

const EMPTY: ShopSettings = {
  small_business: true,
  shipping_options: [],
  production_tiers: [],
  bank: { holder: "", iban: "", bic: "", name: "" },
  invoice_separately: true,
  free_shipping_threshold: null,
  volume_discounts: [],
}

/**
 * Shop settings edited in the Medusa admin (Settings > Store). Revalidated
 * every few minutes so changes show up without a deploy.
 */
export const getShopSettings = async (): Promise<ShopSettings> =>
  sdk.client
    .fetch<ShopSettings>(`/store/shop-settings`, {
      method: "GET",
      next: { revalidate: 300 },
      cache: "force-cache",
    })
    // Fill fields missing from older (cached) responses.
    .then((settings) => ({ ...EMPTY, ...settings }))
    .catch(() => EMPTY)

export const getProductionTiers = async (): Promise<ProductionTier[]> =>
  (await getShopSettings()).production_tiers
