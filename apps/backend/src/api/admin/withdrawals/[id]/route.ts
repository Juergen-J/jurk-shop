import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { updateWithdrawalStatusWorkflow } from "../../../../workflows/update-withdrawal-status"

/** Marks a withdrawal as processed (or back to received). */
export async function POST(
  req: AuthenticatedMedusaRequest<{ status: "received" | "processed" }>,
  res: MedusaResponse
) {
  const { result } = await updateWithdrawalStatusWorkflow(req.scope).run({
    input: { id: req.params.id, status: req.validatedBody.status },
  })

  res.json({ withdrawal: result })
}
