import { SHOP_NAME } from "@lib/constants"
import { shopUrl } from "@lib/data/seo"
import { HttpTypes } from "@medusajs/types"

/**
 * schema.org Product for search engines and AI assistants: name, photos,
 * price (range) and that every box is made to order.
 */
const ProductJsonLd = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const url = shopUrl(`/products/${product.handle}`)
  const prices = (product.variants ?? [])
    .map((v) => v.calculated_price?.calculated_amount)
    .filter((a): a is number => typeof a === "number")
  const currency =
    product.variants?.[0]?.calculated_price?.currency_code?.toUpperCase()

  const offerBase = {
    url,
    priceCurrency: currency,
    // Printed after the order, so never "InStock"
    availability: "https://schema.org/MadeToOrder",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@type": "Organization", name: SHOP_NAME },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "DE",
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 14,
      returnMethod: "https://schema.org/ReturnByMail",
    },
  }

  const low = prices.length ? Math.min(...prices) : null
  const high = prices.length ? Math.max(...prices) : null

  const offers =
    low === null
      ? undefined
      : low === high
        ? { "@type": "Offer", price: low, ...offerBase }
        : {
            "@type": "AggregateOffer",
            lowPrice: low,
            highPrice: high,
            offerCount: prices.length,
            ...offerBase,
          }

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? product.subtitle ?? undefined,
    url,
    image: (product.images ?? [])
      .map((i) => i.url)
      .filter(Boolean)
      .slice(0, 10),
    brand: { "@type": "Brand", name: "JURK.PRO" },
    category: product.categories?.[0]?.name,
    material: product.material ?? undefined,
    offers,
  }

  return (
    <script
      type="application/ld+json"
      // "<" escaped so a product text can't close the script tag
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}

export default ProductJsonLd
