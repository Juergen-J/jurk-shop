import { COMPANY } from "../../../legal/company"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  parseProductionTiers,
  PRODUCTION_TIERS_KEY,
} from "../../../utils/production-tiers"
import {
  parseShopSettings,
  SHOP_SETTINGS_KEY,
  toPublicShopSettings,
} from "../../../utils/shop-settings"

type ShippingOptionRow = {
  name: string
  price_type: string
  rules?: { attribute: string; value: unknown }[] | null
  prices?: {
    currency_code?: string | null
    amount?: number | null
    price_rules?: unknown[] | null
  }[]
}

/** Settings the storefront needs: production time, bank details, discounts. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["metadata"],
  })
  const metadata = stores[0]?.metadata

  // Base price of each flat shipping option (the price without rules).
  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: [
      "name",
      "price_type",
      "rules.attribute",
      "rules.value",
      "prices.currency_code",
      "prices.amount",
      "prices.price_rules.attribute",
    ],
  })

  const shipping_options = (shippingOptions as unknown as ShippingOptionRow[])
    .filter(
      (option) =>
        option.price_type === "flat" &&
        !option.rules?.some(
          (rule) => rule?.attribute === "is_return" && rule.value === "true"
        )
    )
    .map((option) => ({
      name: option.name,
      amount:
        option.prices?.find(
          (price) =>
            price?.currency_code === "eur" && !price.price_rules?.length
        )?.amount ?? null,
    }))

  res.json({
    small_business: COMPANY.smallBusiness,
    shipping_options,
    production_tiers: parseProductionTiers(metadata?.[PRODUCTION_TIERS_KEY]),
    ...toPublicShopSettings(
      parseShopSettings(metadata?.[SHOP_SETTINGS_KEY])
    ),
  })
}
