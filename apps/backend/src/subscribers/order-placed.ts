import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendOrderEmailsWorkflow } from "../workflows/send-order-emails"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendOrderEmailsWorkflow(container).run({
    input: { order_id: data.id },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
