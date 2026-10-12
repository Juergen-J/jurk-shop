import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { getShopSettings } from "@lib/data/shop-settings"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SHOP_NAME } from "@lib/constants"
import { notFound } from "next/navigation"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart")
  return { title: `${t("title")} | ${SHOP_NAME}` }
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const customer = await retrieveCustomer()
  const shopSettings = await getShopSettings()

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      shopSettings={shopSettings}
    />
  )
}
