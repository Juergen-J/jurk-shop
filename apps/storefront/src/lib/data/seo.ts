import "server-only"

import { sdk } from "@lib/config"
import { getBaseURL } from "@lib/util/env"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "./categories"
import { getRegion } from "./regions"

/** The storefront has one region; every URL starts with its country code. */
export const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "de"

/** Absolute URL of a storefront path, e.g. shopUrl("/products/x"). */
export const shopUrl = (path = "") =>
  `${getBaseURL().replace(/\/$/, "")}/${DEFAULT_COUNTRY}${path}`

export type SeoProduct = Pick<
  HttpTypes.StoreProduct,
  "handle" | "title" | "subtitle" | "updated_at"
> & {
  categoryIds: string[]
  /** Cheapest variant price in the region, null when none is set. */
  minPrice: number | null
  currency: string | null
}

const PAGE_SIZE = 100

/**
 * Every published product with only the fields the sitemap and llms.txt
 * need. Lighter than listProducts, whose full payload is too large for the
 * Next.js data cache once the catalog grows.
 */
export const listSeoProducts = async (): Promise<SeoProduct[]> => {
  const region = await getRegion(DEFAULT_COUNTRY)
  const products: SeoProduct[] = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { products: page, count } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>("/store/products", {
      method: "GET",
      query: {
        limit: PAGE_SIZE,
        offset,
        region_id: region?.id,
        fields:
          "handle,title,subtitle,updated_at,*categories,*variants.calculated_price",
      },
      next: { revalidate: 3600 },
    })

    for (const p of page) {
      const prices = (p.variants ?? [])
        .map((v) => v.calculated_price?.calculated_amount)
        .filter((a): a is number => typeof a === "number")

      products.push({
        handle: p.handle,
        title: p.title,
        subtitle: p.subtitle,
        updated_at: p.updated_at,
        categoryIds: (p.categories ?? []).map((c) => c.id),
        minPrice: prices.length ? Math.min(...prices) : null,
        currency:
          p.variants?.[0]?.calculated_price?.currency_code?.toUpperCase() ??
          null,
      })
    }

    if (offset + PAGE_SIZE >= count) {
      return products
    }
  }
}

export const listSeoCategories = async () =>
  (await listCategories({ fields: "id,handle,name,parent_category_id" })) ??
  []
