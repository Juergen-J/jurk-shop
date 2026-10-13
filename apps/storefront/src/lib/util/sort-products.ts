import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
}

/**
 * Helper function to sort products by price until the store API supports sorting by price
 * @param products
 * @param sortBy
 * @returns products sorted by price
 */
export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  const sortedProducts = products as MinPricedProduct[]

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Precompute the minimum price for each product
    sortedProducts.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product._minPrice = Math.min(
          ...product.variants.map(
            (variant) => variant?.calculated_price?.calculated_amount || 0
          )
        )
      } else {
        product._minPrice = Infinity
      }
    })

    // Sort products based on the precomputed minimum prices
    sortedProducts.sort((a, b) => {
      const diff = a._minPrice! - b._minPrice!
      return sortBy === "price_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  if (sortBy === "popularity") {
    // metadata.rank from catalog.csv ("rang", 1 = most popular); unranked
    // products follow by title, numbers in natural order (.22 before .223).
    const collator = new Intl.Collator("de", { numeric: true })
    const rank = (p: HttpTypes.StoreProduct) => {
      const value = Number(p.metadata?.rank)
      return Number.isFinite(value) && value > 0 ? value : Infinity
    }
    sortedProducts.sort(
      (a, b) =>
        rank(a) - rank(b) || collator.compare(a.title ?? "", b.title ?? "")
    )
  }

  return sortedProducts
}
