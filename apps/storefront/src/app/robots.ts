import type { MetadataRoute } from "next"

import { getBaseURL } from "@lib/util/env"

// Pages that are per customer or not meant for search results. Paths start
// with the country code; "*" covers every region.
const PRIVATE_PATHS = [
  "/*/cart",
  "/*/checkout",
  "/*/account",
  "/*/order",
  "/*/verify-account",
  "/*/dev",
]

export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL().replace(/\/$/, "")

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    sitemap: `${base}/sitemap.xml`,
  }
}
