import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendOrderStatusEmailWorkflow } from "../workflows/send-order-status-email"

/** "Deine Bestellung ist unterwegs" with the DHL tracking number, if entered. */
export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  if (data.no_notification) return

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: fulfillments } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "order.id", "labels.tracking_number", "labels.tracking_url"],
    filters: { id: data.id },
  })
  const fulfillment = fulfillments[0] as {
    id: string
    order?: { id?: string }
    labels?: { tracking_number?: string; tracking_url?: string }[]
  }
  if (!fulfillment?.order?.id) return

  const label = fulfillment.labels?.find((l) => l.tracking_number)
  await sendOrderStatusEmailWorkflow(container).run({
    input: {
      order_id: fulfillment.order.id,
      kind: "shipped",
      fulfillment_id: fulfillment.id,
      tracking_number: label?.tracking_number,
      // Medusa's form defaults the URL to "#" when left empty.
      tracking_url: label?.tracking_url && label.tracking_url !== "#" ? label.tracking_url : undefined,
    },
  })
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
