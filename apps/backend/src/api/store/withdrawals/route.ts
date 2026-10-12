import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { submitWithdrawalWorkflow } from "../../../workflows/submit-withdrawal"
import { PostStoreWithdrawalType } from "./validators"

export async function POST(
  req: MedusaRequest<PostStoreWithdrawalType>,
  res: MedusaResponse
) {
  const { result } = await submitWithdrawalWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  // Only what the confirmation page shows; never the stored order link.
  res.status(201).json({
    withdrawal: {
      id: result.id,
      name: result.name,
      email: result.email,
      order_number: result.order_number,
      items: result.items,
      received_at: result.created_at,
    },
  })
}
