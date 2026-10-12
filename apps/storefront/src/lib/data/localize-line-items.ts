import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

type LineItem = HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem

/**
 * Medusa translates products, options and values on the product endpoints but
 * not inside cart or order line items. This loads the line items' products in
 * the current locale and puts the translated product title and variant options
 * (with their option titles) onto each item.
 */
export async function localizeLineItems<T extends { items?: LineItem[] | null }>(
  container: T
): Promise<T> {
  const items = container.items ?? []
  const productIds = Array.from(
    new Set(items.map((item) => item.product_id).filter(Boolean))
  ) as string[]

  if (!productIds.length) {
    return container
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  const products = await sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[] }>(`/store/products`, {
      method: "GET",
      query: {
        id: productIds,
        fields: "id,title,*options,*variants.options",
        limit: productIds.length,
      },
      next,
      cache: "force-cache",
    })
    .then(({ products }) => products)
    .catch(() => [] as HttpTypes.StoreProduct[])

  const productsById = new Map(products.map((p) => [p.id, p]))

  return {
    ...container,
    items: items.map((item) => {
      const product = item.product_id
        ? productsById.get(item.product_id)
        : undefined

      if (!product) {
        return item
      }

      const optionTitles = new Map(
        (product.options ?? []).map((o) => [o.id, o.title])
      )
      const variant = product.variants?.find((v) => v.id === item.variant_id)
      const options = (variant?.options ?? []).map((o) => ({
        ...o,
        option: { ...o.option, title: optionTitles.get(o.option_id ?? "") },
      }))

      return {
        ...item,
        product: { ...item.product, title: product.title },
        variant: { ...item.variant, options },
      }
    }),
  } as T
}
