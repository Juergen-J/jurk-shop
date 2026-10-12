"use client"

import { Button, Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"
import ProductionTime from "@modules/common/components/production-time"
import { countItems, estimateProduction } from "@lib/util/production-time"
import { ShopSettings } from "@lib/data/shop-settings"
import CartIncentives from "@modules/cart/components/cart-incentives"

type SummaryProps = {
  cart: HttpTypes.StoreCart
  shopSettings: ShopSettings
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, shopSettings }: SummaryProps) => {
  const t = useTranslations("cart")
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        {t("summary")}
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <CartIncentives cart={cart} settings={shopSettings} />
      <ProductionTime
        estimate={estimateProduction(
          shopSettings.production_tiers,
          countItems(cart.items)
        )}
      />
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-11">{t("goToCheckout")}</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
