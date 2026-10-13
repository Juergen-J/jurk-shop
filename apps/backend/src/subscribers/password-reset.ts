import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { renderAdminPasswordReset } from "../emails/order-status"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * "Passwort vergessen" in the admin. Customer accounts are not offered in the
 * storefront, so only admin users get a link.
 */
export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; actor_type: string; token: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (data.actor_type !== "user") {
    logger.info(`[email] Password reset for ${data.actor_type} not supported, ignored.`)
    return
  }

  const url = new URL("/app/reset-password", BACKEND_URL)
  url.searchParams.set("token", data.token)
  url.searchParams.set("email", data.entity_id)

  await container.resolve(Modules.NOTIFICATION).createNotifications({
    to: data.entity_id,
    channel: "email",
    template: "admin-password-reset",
    content: renderAdminPasswordReset(url.toString()),
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
