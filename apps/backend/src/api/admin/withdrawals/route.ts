import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { WITHDRAWAL_MODULE } from "../../../modules/withdrawal"
import WithdrawalModuleService from "../../../modules/withdrawal/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: WithdrawalModuleService = req.scope.resolve(WITHDRAWAL_MODULE)

  const withdrawals = await service.listWithdrawals(
    {},
    { order: { created_at: "DESC" }, take: 200 }
  )

  res.json({ withdrawals })
}
