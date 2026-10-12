import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { isLegalSlug, LEGAL_DOCUMENTS } from "../../../../legal/documents"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params

  if (!isLegalSlug(slug)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Unknown page "${slug}"`)
  }

  res.json({ document: LEGAL_DOCUMENTS[slug] })
}
