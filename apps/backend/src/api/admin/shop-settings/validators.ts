import { z } from "@medusajs/framework/zod"

export const PostAdminShopSettings = z.object({
  bank: z.object({
    holder: z.string().trim(),
    iban: z.string().trim(),
    bic: z.string().trim(),
    name: z.string().trim(),
  }),
  invoice_separately: z.boolean().default(true),
  order_notification_email: z.union([z.literal(""), z.string().trim().email()]),
  free_shipping_threshold: z.number().positive().nullable(),
  volume_discounts: z
    .array(
      z.object({
        min_total: z.number().positive(),
        percent: z.number().positive().lt(100),
      })
    )
    .refine(
      (tiers) => new Set(tiers.map((t) => t.min_total)).size === tiers.length,
      "Each order value may only be used once"
    ),
})

export type PostAdminShopSettingsType = z.infer<typeof PostAdminShopSettings>
