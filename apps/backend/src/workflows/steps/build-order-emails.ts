import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { SendNotificationsStepInput } from "@medusajs/medusa/core-flows"
import {
  EmailOrder,
  renderNewOrderNotification,
  renderOrderConfirmation,
} from "../../emails/order-confirmation"
import { toEmailLocale } from "../../emails/i18n"
import {
  estimateProduction,
  parseProductionTiers,
  PRODUCTION_TIERS_KEY,
} from "../../utils/production-tiers"
import { parseShopSettings, SHOP_SETTINGS_KEY } from "../../utils/shop-settings"

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "info@jurk.pro"
const LOCALE_CODES = { de: "de-DE", en: "en-US" } as const

type OrderRow = {
  id: string
  display_id: number
  email: string
  locale?: string | null
  created_at: string | Date
  item_total: number
  shipping_total: number
  discount_total: number
  tax_total: number
  total: number
  items: {
    product_title?: string | null
    title: string
    product_id?: string | null
    quantity: number
    original_total: number
    metadata?: Record<string, unknown> | null
    variant?: {
      options?: {
        id: string
        value: string
        option_id?: string | null
        option?: { id: string; title: string } | null
      }[]
    } | null
  }[]
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    company?: string | null
    address_1?: string | null
    address_2?: string | null
    postal_code?: string | null
    city?: string | null
    country_code?: string | null
  } | null
  shipping_methods?: { name: string }[]
  payment_collections?: {
    payment_sessions?: { provider_id: string }[]
  }[]
}

export const buildOrderEmailsStep = createStep(
  "build-order-emails",
  async ({ order_id }: { order_id: string }, { container }) => {
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
        "created_at",
        "item_total",
        "shipping_total",
        "discount_total",
        "tax_total",
        "total",
        "items.title",
        "items.product_title",
        "items.product_id",
        "items.quantity",
        "items.original_total",
        "items.metadata",
        "items.variant.options.id",
        "items.variant.options.value",
        "items.variant.options.option_id",
        "items.variant.options.option.id",
        "items.variant.options.option.title",
        "shipping_address.*",
        "shipping_methods.name",
        "payment_collections.payment_sessions.provider_id",
      ],
      filters: { id: order_id },
    })) as unknown as { data: OrderRow[] }

    const { data: stores } = await query.graph({
      entity: "store",
      fields: ["metadata"],
    })

    const settings = parseShopSettings(stores[0]?.metadata?.[SHOP_SETTINGS_KEY])
    const tiers = parseProductionTiers(stores[0]?.metadata?.[PRODUCTION_TIERS_KEY])
    const locale = toEmailLocale(order.locale)

    // Order items keep the German snapshot; look up the customer's language.
    const translate = await loadTranslations(container, order, locale)

    const address = order.shipping_address
    const regionNames = new Intl.DisplayNames([locale], { type: "region" })
    const name = [address?.first_name, address?.last_name]
      .filter(Boolean)
      .join(" ")

    const emailOrder: EmailOrder = {
      displayId: String(order.display_id),
      email: order.email,
      createdAt: new Date(order.created_at),
      customerName: name,
      items: order.items.map((item) => ({
        title: translate(item.product_id, item.product_title ?? item.title),
        options: (item.variant?.options ?? []).map((o) => ({
          title: translate(o.option_id ?? o.option?.id, o.option?.title ?? ""),
          value: translate(o.id, o.value),
        })),
        requestedColor:
          typeof item.metadata?.requested_color === "string"
            ? item.metadata.requested_color
            : undefined,
        quantity: item.quantity,
        // before discounts, so the lines add up to the subtotal
        total: item.original_total,
      })),
      itemTotal: order.item_total,
      discountTotal: order.discount_total,
      shippingTotal: order.shipping_total,
      taxTotal: order.tax_total,
      total: order.total,
      shippingAddress: [
        name,
        address?.company,
        [address?.address_1, address?.address_2].filter(Boolean).join(" "),
        [address?.postal_code, address?.city].filter(Boolean).join(" "),
        address?.country_code
          ? regionNames.of(address.country_code.toUpperCase())
          : "",
      ].filter((line): line is string => Boolean(line)),
      shippingMethod: order.shipping_methods?.[0]?.name ?? "-",
      isManualPayment: !!order.payment_collections?.some((pc) =>
        pc.payment_sessions?.some((s) =>
          s.provider_id.startsWith("pp_system_default")
        )
      ),
    }

    const boxCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const context = {
      order: emailOrder,
      locale,
      bank: settings.bank,
      invoiceSeparately: settings.invoice_separately,
      production: estimateProduction(tiers, boxCount),
      boxCount,
      contactEmail: CONTACT_EMAIL,
    }

    const notifications: SendNotificationsStepInput = [
      {
        to: order.email,
        channel: "email",
        template: "order-confirmation",
        content: renderOrderConfirmation(context),
        trigger_type: "order.placed",
        resource_id: order.id,
        resource_type: "order",
        idempotency_key: `order-confirmation-${order.id}`,
      },
    ]

    if (settings.order_notification_email) {
      notifications.push({
        to: settings.order_notification_email,
        channel: "email",
        template: "new-order-admin",
        content: renderNewOrderNotification(context),
        trigger_type: "order.placed",
        resource_id: order.id,
        resource_type: "order",
        idempotency_key: `new-order-admin-${order.id}`,
      })
    }

    return new StepResponse(notifications)
  }
)

/**
 * Returns a lookup from product / option / option value IDs to their text in
 * the email's language, falling back to the original German value.
 */
async function loadTranslations(
  container: Parameters<Parameters<typeof createStep>[1]>[1]["container"],
  order: OrderRow,
  locale: keyof typeof LOCALE_CODES
) {
  if (locale === "de") {
    return (_id: string | null | undefined, fallback: string) => fallback
  }

  const ids = new Set<string>()
  order.items.forEach((item) => {
    if (item.product_id) ids.add(item.product_id)
    item.variant?.options?.forEach((o) => {
      ids.add(o.id)
      if (o.option_id) ids.add(o.option_id)
    })
  })

  const translationService = container.resolve(Modules.TRANSLATION)
  const translations = await translationService.listTranslations({
    reference_id: Array.from(ids),
    locale_code: LOCALE_CODES[locale],
  })

  const byId = new Map(
    translations.map((t) => {
      const fields = t.translations as Record<string, string>
      return [t.reference_id, fields.title ?? fields.value ?? fields.name]
    })
  )

  return (id: string | null | undefined, fallback: string) =>
    (id && byId.get(id)) || fallback
}
