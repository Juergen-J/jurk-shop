import { Heading } from "@modules/common/components/ui"
import { getTranslations } from "next-intl/server"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import BankTransferNotice from "@modules/order/components/bank-transfer-notice"
import { HttpTypes } from "@medusajs/types"
import ProductionTime from "@modules/common/components/production-time"
import { getProductionTiers } from "@lib/data/shop-settings"
import { countItems, estimateProduction } from "@lib/util/production-time"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const t = await getTranslations("order")
  const productionTiers = await getProductionTiers()

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            <span>{t("thanks")}</span>
            <span className="text-ui-fg-subtle text-2xl">{t("placed")}</span>
          </Heading>
          <OrderDetails order={order} />
          <BankTransferNotice order={order} />
          <ProductionTime
            estimate={estimateProduction(
              productionTiers,
              countItems(order.items)
            )}
          />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            {t("summary")}
          </Heading>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
