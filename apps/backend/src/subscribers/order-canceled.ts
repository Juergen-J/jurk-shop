import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendOrderStatusEmailWorkflow } from "../workflows/send-order-status-email"

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendOrderStatusEmailWorkflow(container).run({
    input: { order_id: data.id, kind: "canceled" },
  })
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
