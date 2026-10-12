import { z } from "@medusajs/framework/zod"

export const PostStoreWithdrawal = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  order_number: z.string().trim().min(1).max(50),
  items: z.string().trim().max(2000).optional().nullable(),
  locale: z.string().max(20).optional().nullable(),
})

export type PostStoreWithdrawalType = z.infer<typeof PostStoreWithdrawal>
