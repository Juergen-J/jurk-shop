import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { SHOP_NAME } from "@lib/constants"
import Hero from "@modules/home/components/hero"
import Highlights from "@modules/home/components/highlights"
import ProductPreview from "@modules/products/components/product-preview"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  return {
    title: `${SHOP_NAME} | ${t("metaTitle")}`,
    description: t("metaDescription"),
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const t = await getTranslations("home")

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: { limit: 8 },
  })

  return (
    <>
      <Hero />
      <Highlights />
      {products.length > 0 && (
        <section className="content-container py-16 small:py-24">
          <h2 className="text-2xl-semi mb-8">{t("productsTitle")}</h2>
          <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
