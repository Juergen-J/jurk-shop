import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"
import { buildOrderEmailsStep } from "./steps/build-order-emails"

/** Order confirmation for the customer and, if configured, the shop owner. */
export const sendOrderEmailsWorkflow = createWorkflow(
  "send-order-emails",
  (input: { order_id: string }) => {
    const notifications = buildOrderEmailsStep(input)

    return new WorkflowResponse(sendNotificationsStep(notifications))
  }
)
