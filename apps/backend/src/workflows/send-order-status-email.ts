import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"
import {
  BuildOrderStatusEmailInput,
  buildOrderStatusEmailStep,
} from "./steps/build-order-status-email"

/** Tells the customer that the order was paid, shipped or canceled. */
export const sendOrderStatusEmailWorkflow = createWorkflow(
  "send-order-status-email",
  (input: BuildOrderStatusEmailInput) => {
    const notifications = buildOrderStatusEmailStep(input)
    return new WorkflowResponse(sendNotificationsStep(notifications))
  }
)
