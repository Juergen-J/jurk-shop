import { COMPANY } from "../legal/company"

/**
 * Shop settings edited in the admin (Settings > Store) and kept in the store's
 * metadata. Free shipping and volume discounts are additionally synced to the
 * shipping option prices and to automatic promotions, which is what Medusa
 * actually applies to carts.
 */
export type BankDetails = {
  holder: string
  iban: string
  bic: string
  name: string
}

/** Percentage off the whole order from a gross order value (EUR) upwards. */
export type VolumeDiscount = {
  min_total: number
  percent: number
}

export type ShopSettings = {
  bank: BankDetails
  /**
   * The invoice (with bank details and QR code) is sent separately, e.g. from
   * Lexware, and customers pay with the invoice number as reference. When
   * false, customers pay right away with the order number.
   */
  invoice_separately: boolean
  order_notification_email: string
  free_shipping_threshold: number | null
  volume_discounts: VolumeDiscount[]
}

export const SHOP_SETTINGS_KEY = "shop_settings"

/** Code prefix of the automatic promotions created for volume discounts. */
export const VOLUME_DISCOUNT_CODE_PREFIX = "MENGENRABATT-"

/**
 * Promotion rules compare against the cart's net item subtotal, so the gross
 * thresholds entered in the admin are converted with this rate. As a
 * Kleinunternehmer no VAT is charged, so net and gross are the same.
 */
export const VAT_RATE = COMPANY.smallBusiness ? 0 : 0.19

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  bank: { holder: "", iban: "", bic: "", name: "" },
  invoice_separately: true,
  order_notification_email: "",
  free_shipping_threshold: null,
  volume_discounts: [],
}

const toNumber = (value: unknown): number | null => {
  const number = typeof value === "string" ? Number(value) : value
  return typeof number === "number" && Number.isFinite(number) ? number : null
}

const toText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : ""

export const sortVolumeDiscounts = (
  discounts: VolumeDiscount[]
): VolumeDiscount[] => [...discounts].sort((a, b) => a.min_total - b.min_total)

/** Parses the metadata value, dropping anything invalid. */
export const parseShopSettings = (raw: unknown): ShopSettings => {
  let parsed: Record<string, unknown> = {}

  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw
    if (value && typeof value === "object") {
      parsed = value as Record<string, unknown>
    }
  } catch {
    // invalid JSON, use defaults
  }

  const bank = (parsed.bank ?? {}) as Record<string, unknown>
  const threshold = toNumber(parsed.free_shipping_threshold)
  const discounts = Array.isArray(parsed.volume_discounts)
    ? parsed.volume_discounts
    : []

  return {
    bank: {
      holder: toText(bank.holder),
      iban: toText(bank.iban),
      bic: toText(bank.bic),
      name: toText(bank.name),
    },
    invoice_separately: parsed.invoice_separately !== false,
    order_notification_email: toText(parsed.order_notification_email),
    free_shipping_threshold: threshold !== null && threshold > 0 ? threshold : null,
    volume_discounts: sortVolumeDiscounts(
      discounts
        .map((d) => ({
          min_total: toNumber((d as VolumeDiscount)?.min_total),
          percent: toNumber((d as VolumeDiscount)?.percent),
        }))
        .filter(
          (d): d is VolumeDiscount =>
            d.min_total !== null &&
            d.min_total > 0 &&
            d.percent !== null &&
            d.percent > 0 &&
            d.percent < 100
        )
    ),
  }
}

/** The part of the settings customers may see. */
export const toPublicShopSettings = (settings: ShopSettings) => ({
  bank: settings.bank,
  invoice_separately: settings.invoice_separately,
  free_shipping_threshold: settings.free_shipping_threshold,
  volume_discounts: settings.volume_discounts,
})
