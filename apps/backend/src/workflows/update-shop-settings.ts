import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createPromotionsWorkflow,
  deletePromotionsWorkflow,
  updateShippingOptionsWorkflow,
  updateStoresWorkflow,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { PromotionStatus } from "@medusajs/framework/utils"
import {
  SHOP_SETTINGS_KEY,
  ShopSettings,
  VAT_RATE,
  VOLUME_DISCOUNT_CODE_PREFIX,
} from "../utils/shop-settings"

const CURRENCY = "eur"

type ShippingOptionRow = {
  id: string
  price_type: string
  prices?: {
    currency_code?: string | null
    amount?: number | null
    price_rules?: { attribute: string }[] | null
  }[]
}

/**
 * Saves the shop settings and applies them:
 * - free shipping: a 0 EUR price with an item_total >= threshold rule on every
 *   flat shipping option (removed again when the threshold is cleared)
 * - volume discounts: one automatic percentage promotion per tier, each limited
 *   to its own order value range so tiers never stack
 */
export const updateShopSettingsWorkflow = createWorkflow(
  "update-shop-settings",
  (input: ShopSettings) => {
    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["id", "metadata"],
    })

    const storeUpdate = transform({ stores, input }, ({ stores, input }) => ({
      selector: { id: stores[0].id },
      update: {
        metadata: {
          ...(stores[0].metadata ?? {}),
          [SHOP_SETTINGS_KEY]: JSON.stringify(input),
        },
      },
    }))

    updateStoresWorkflow.runAsStep({ input: storeUpdate })

    // Free shipping
    const { data: shippingOptions } = useQueryGraphStep({
      entity: "shipping_option",
      fields: [
        "id",
        "price_type",
        "prices.currency_code",
        "prices.amount",
        "prices.price_rules.attribute",
      ],
    }).config({ name: "get-shipping-options" })

    const shippingUpdates = transform(
      { shippingOptions, input },
      ({ shippingOptions, input }) =>
        (shippingOptions as ShippingOptionRow[])
          .filter((option) => option.price_type === "flat")
          .map((option) => {
            const basePrice = (option.prices ?? []).find(
              (price) =>
                price.currency_code === CURRENCY && !price.price_rules?.length
            )

            if (!basePrice || typeof basePrice.amount !== "number") {
              return null
            }

            return {
              id: option.id,
              prices: [
                { currency_code: CURRENCY, amount: basePrice.amount },
                ...(input.free_shipping_threshold
                  ? [
                      {
                        currency_code: CURRENCY,
                        amount: 0,
                        rules: [
                          {
                            attribute: "item_total",
                            operator: "gte" as const,
                            value: input.free_shipping_threshold,
                          },
                        ],
                      },
                    ]
                  : []),
              ],
            }
          })
          .filter((update) => update !== null)
    )

    updateShippingOptionsWorkflow.runAsStep({ input: shippingUpdates })

    // Volume discounts
    const { data: promotions } = useQueryGraphStep({
      entity: "promotion",
      fields: ["id", "code"],
    }).config({ name: "get-promotions" })

    const oldPromotionIds = transform({ promotions }, ({ promotions }) =>
      promotions
        .filter((promotion) =>
          promotion.code?.startsWith(VOLUME_DISCOUNT_CODE_PREFIX)
        )
        .map((promotion) => promotion.id)
    )

    when({ oldPromotionIds }, ({ oldPromotionIds }) => oldPromotionIds.length > 0)
      .then(() => {
        deletePromotionsWorkflow.runAsStep({ input: { ids: oldPromotionIds } })
      })

    const promotionsData = transform({ input }, ({ input }) =>
      input.volume_discounts.map((tier, index, tiers) => {
        // Rules use the net item subtotal before discounts, so the discount
        // itself can't push the cart back below its own threshold.
        const toNet = (gross: number) =>
          String(Math.round((gross / (1 + VAT_RATE)) * 100) / 100)
        const next = tiers[index + 1]

        return {
          code: `${VOLUME_DISCOUNT_CODE_PREFIX}${tier.min_total}`,
          type: "standard" as const,
          status: PromotionStatus.ACTIVE,
          is_automatic: true,
          is_tax_inclusive: true,
          application_method: {
            type: "percentage" as const,
            target_type: "items" as const,
            allocation: "across" as const,
            value: tier.percent,
            currency_code: CURRENCY,
          },
          rules: [
            {
              attribute: "item_subtotal",
              operator: "gte" as const,
              values: [toNet(tier.min_total)],
            },
            ...(next
              ? [
                  {
                    attribute: "item_subtotal",
                    operator: "lt" as const,
                    values: [toNet(next.min_total)],
                  },
                ]
              : []),
          ],
        }
      })
    )

    when({ promotionsData }, ({ promotionsData }) => promotionsData.length > 0)
      .then(() => {
        createPromotionsWorkflow.runAsStep({ input: { promotionsData } })
      })

    return new WorkflowResponse(input)
  }
)
