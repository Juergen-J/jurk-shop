import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateShopSettingsWorkflow } from "../../../workflows/update-shop-settings"
import {
  parseShopSettings,
  SHOP_SETTINGS_KEY,
  sortVolumeDiscounts,
} from "../../../utils/shop-settings"
import { PostAdminShopSettingsType } from "./validators"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["metadata"],
  })

  res.json({
    shop_settings: parseShopSettings(stores[0]?.metadata?.[SHOP_SETTINGS_KEY]),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<PostAdminShopSettingsType>,
  res: MedusaResponse
) {
  const { result } = await updateShopSettingsWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      volume_discounts: sortVolumeDiscounts(req.validatedBody.volume_discounts),
    },
  })

  res.json({ shop_settings: result })
}
