import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendOrderStatusEmailWorkflow } from "../workflows/send-order-status-email"

/** "Zahlung eingegangen" once a payment is marked as captured (paid). */
export default async function paymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: payments } = await query.graph({
    entity: "payment",
    fields: ["payment_collection.order.id"],
    filters: { id: data.id },
  })
  const orderId = (payments[0] as { payment_collection?: { order?: { id?: string } } })
    ?.payment_collection?.order?.id
  if (!orderId) return

  await sendOrderStatusEmailWorkflow(container).run({
    input: { order_id: orderId, kind: "payment-received" },
  })
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
