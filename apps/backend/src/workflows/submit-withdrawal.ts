import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  sendNotificationsStep,
  SendNotificationsStepInput,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { WITHDRAWAL_MODULE } from "../modules/withdrawal"
import WithdrawalModuleService from "../modules/withdrawal/service"
import { COMPANY } from "../legal/company"
import { toEmailLocale } from "../emails/i18n"
import {
  renderWithdrawalConfirmation,
  renderWithdrawalNotification,
} from "../emails/withdrawal"
import { parseShopSettings, SHOP_SETTINGS_KEY } from "../utils/shop-settings"

export type SubmitWithdrawalInput = {
  name: string
  email: string
  order_number: string
  items?: string | null
  locale?: string | null
}

const createWithdrawalStep = createStep(
  "create-withdrawal",
  async (input: SubmitWithdrawalInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const service: WithdrawalModuleService = container.resolve(WITHDRAWAL_MODULE)

    // Link the order when number and email match. The withdrawal is recorded
    // either way: a declaration must never be rejected for a typo.
    const displayId = Number(input.order_number.replace(/\D/g, ""))
    let orderId: string | null = null

    if (displayId) {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "email"],
        filters: { display_id: String(displayId) },
      })
      const match = orders.find(
        (o) => o.email?.toLowerCase() === input.email.toLowerCase()
      )
      orderId = match?.id ?? null
    }

    const withdrawal = await service.createWithdrawals({
      name: input.name,
      email: input.email,
      order_number: input.order_number,
      items: input.items || null,
      order_id: orderId,
      locale: toEmailLocale(input.locale),
    })

    return new StepResponse(withdrawal, withdrawal.id)
  },
  async (id, { container }) => {
    if (!id) {
      return
    }

    const service: WithdrawalModuleService = container.resolve(WITHDRAWAL_MODULE)
    await service.deleteWithdrawals(id)
  }
)

/**
 * Online withdrawal function (§ 356a BGB): records the declaration and sends
 * the customer a confirmation of receipt with its content, date and time.
 */
export const submitWithdrawalWorkflow = createWorkflow(
  "submit-withdrawal",
  (input: SubmitWithdrawalInput) => {
    const withdrawal = createWithdrawalStep(input)

    const { data: stores } = useQueryGraphStep({
      entity: "store",
      fields: ["metadata"],
    })

    const notifications = transform(
      { withdrawal, stores },
      ({ withdrawal, stores }): SendNotificationsStepInput => {
        const settings = parseShopSettings(
          stores[0]?.metadata?.[SHOP_SETTINGS_KEY]
        )
        const data = {
          name: withdrawal.name,
          email: withdrawal.email,
          orderNumber: withdrawal.order_number,
          items: withdrawal.items,
          receivedAt: new Date(withdrawal.created_at),
        }

        return [
          {
            to: withdrawal.email,
            channel: "email",
            template: "withdrawal-confirmation",
            content: renderWithdrawalConfirmation(
              data,
              toEmailLocale(withdrawal.locale)
            ),
            resource_id: withdrawal.id,
            resource_type: "withdrawal",
            idempotency_key: `withdrawal-confirmation-${withdrawal.id}`,
          },
          {
            // Withdrawals must always reach the shop, so fall back to the
            // contact address when no notification email is configured.
            to: settings.order_notification_email || COMPANY.email,
            channel: "email",
            template: "withdrawal-admin",
            content: renderWithdrawalNotification(data, !!withdrawal.order_id),
            resource_id: withdrawal.id,
            resource_type: "withdrawal",
            idempotency_key: `withdrawal-admin-${withdrawal.id}`,
          },
        ]
      }
    )

    sendNotificationsStep(notifications)

    return new WorkflowResponse(withdrawal)
  }
)
