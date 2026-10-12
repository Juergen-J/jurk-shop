import {
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostAdminShopSettings } from "./admin/shop-settings/validators"
import { PostStoreWithdrawal } from "./store/withdrawals/validators"
import { z } from "@medusajs/framework/zod"

export default defineMiddlewares({
  routes: [
    // The product index declares filterable `status` and `sales_channel_ids`, so
    // the route narrows it to published products in the key's sales channels.
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    {
      method: ["POST"],
      matcher: "/admin/shop-settings",
      middlewares: [validateAndTransformBody(PostAdminShopSettings)],
    },
    {
      method: ["POST"],
      matcher: "/store/withdrawals",
      middlewares: [validateAndTransformBody(PostStoreWithdrawal)],
    },
    {
      method: ["POST"],
      matcher: "/admin/withdrawals/:id",
      middlewares: [
        validateAndTransformBody(
          z.object({ status: z.enum(["received", "processed"]) })
        ),
      ],
    },
  ],
})
