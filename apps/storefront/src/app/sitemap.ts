import type { MetadataRoute } from "next"

import { listSeoCategories, listSeoProducts, shopUrl } from "@lib/data/seo"

// Built per request (cached for an hour by the fetches): the backend isn't
// reachable while the Docker image builds.
export const dynamic = "force-dynamic"

const LEGAL_PAGES = [
  "/versand-zahlung",
  "/agb",
  "/widerrufsbelehrung",
  "/widerruf",
  "/impressum",
  "/datenschutz",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: shopUrl(), changeFrequency: "daily", priority: 1 },
    ...LEGAL_PAGES.map((path) => ({
      url: shopUrl(path),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ]

  // A backend hiccup still leaves a valid sitemap with the static pages
  const [products, categories] = await Promise.all([
    listSeoProducts().catch(() => []),
    listSeoCategories().catch(() => []),
  ])

  return [
    ...pages,
    ...categories.map((c) => ({
      url: shopUrl(`/categories/${c.handle}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: shopUrl(`/products/${p.handle}`),
      lastModified: p.updated_at ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
