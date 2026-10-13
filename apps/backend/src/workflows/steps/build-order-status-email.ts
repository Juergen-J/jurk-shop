import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { SendNotificationsStepInput } from "@medusajs/medusa/core-flows"
import { messages, toEmailLocale } from "../../emails/i18n"
import { OrderStatusKind, renderOrderStatus } from "../../emails/order-status"
import {
  estimateProduction,
  parseProductionTiers,
  PRODUCTION_TIERS_KEY,
} from "../../utils/production-tiers"

export type BuildOrderStatusEmailInput = {
  order_id: string
  kind: OrderStatusKind
  /** For "shipped": one email per fulfillment */
  fulfillment_id?: string
  tracking_number?: string
  tracking_url?: string
}

type OrderRow = {
  id: string
  display_id: number
  email: string
  locale?: string | null
  items: { quantity: number }[]
  shipping_address?: { first_name?: string | null; last_name?: string | null } | null
}

export const buildOrderStatusEmailStep = createStep(
  "build-order-status-email",
  async (input: BuildOrderStatusEmailInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    const {
      data: [order],
    } = (await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "locale",
        "items.quantity",
        "shipping_address.first_name",
        "shipping_address.last_name",
      ],
      filters: { id: input.order_id },
    })) as unknown as { data: OrderRow[] }

    if (!order?.email) {
      return new StepResponse([] as SendNotificationsStepInput)
    }

    const locale = toEmailLocale(order.locale)
    let productionDays: string | undefined
    if (input.kind === "payment-received") {
      const { data: stores } = await query.graph({ entity: "store", fields: ["metadata"] })
      const tiers = parseProductionTiers(stores[0]?.metadata?.[PRODUCTION_TIERS_KEY])
      const boxes = order.items.reduce((sum, item) => sum + item.quantity, 0)
      const estimate = estimateProduction(tiers, boxes)
      if (estimate) {
        productionDays = messages[locale].days(estimate.min_days, estimate.max_days)
      }
    }

    const content = renderOrderStatus(
      input.kind,
      {
        displayId: String(order.display_id),
        customerName: [order.shipping_address?.first_name, order.shipping_address?.last_name]
          .filter(Boolean)
          .join(" "),
        productionDays,
        trackingNumber: input.tracking_number,
        trackingUrl: input.tracking_url,
      },
      locale
    )

    const notifications: SendNotificationsStepInput = [
      {
        to: order.email,
        channel: "email",
        template: `order-${input.kind}`,
        content,
        trigger_type: `order.${input.kind}`,
        resource_id: order.id,
        resource_type: "order",
        idempotency_key: `order-${input.kind}-${input.fulfillment_id ?? order.id}`,
      },
    ]
    return new StepResponse(notifications)
  }
)
