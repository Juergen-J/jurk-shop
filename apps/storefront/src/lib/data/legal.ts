import { sdk } from "@lib/config"

export type LegalBlock =
  | { type: "h2" | "h3" | "p"; text: string }
  | { type: "lines"; lines: string[] }
  | { type: "list"; items: string[] }

export type LegalDocument = {
  slug: string
  title: string
  updated: string
  blocks: LegalBlock[]
}

export type LegalSlug = "impressum" | "datenschutz" | "agb" | "widerrufsbelehrung"

/** Legal texts live in the backend (src/legal), German only. */
export const getLegalDocument = async (
  slug: LegalSlug
): Promise<LegalDocument | null> =>
  sdk.client
    .fetch<{ document: LegalDocument }>(`/store/legal/${slug}`, {
      method: "GET",
      next: { revalidate: 300 },
      cache: "force-cache",
    })
    .then(({ document }) => document)
    .catch(() => null)
