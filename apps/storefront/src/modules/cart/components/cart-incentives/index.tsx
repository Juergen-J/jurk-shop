import { ShopSettings } from "@lib/data/shop-settings"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, ReceiptPercent, TruckFast } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type CartIncentivesProps = {
  cart: HttpTypes.StoreCart
  settings: ShopSettings
}

const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-1.5 w-full rounded-full bg-ui-bg-subtle overflow-hidden">
    <div
      className="h-full w-full rounded-full bg-brand transition-transform duration-300 ease-out-strong"
      style={{
        transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)`,
      }}
    />
  </div>
)

/**
 * Nudges towards free shipping and the next volume discount tier. Free
 * shipping compares against the discounted item total (what the shipping
 * price rule uses), discounts against the value before discounts.
 */
const CartIncentives = ({ cart, settings }: CartIncentivesProps) => {
  const t = useTranslations("incentives")
  const currency_code = cart.currency_code
  const money = (amount: number) => convertToLocale({ amount, currency_code })

  const itemTotal = cart.item_total ?? 0
  const valueBeforeDiscount = itemTotal + (cart.discount_total ?? 0)

  const threshold = settings.free_shipping_threshold
  const nextDiscount = settings.volume_discounts.find(
    (d) => d.min_total > valueBeforeDiscount
  )

  if (!threshold && !nextDiscount) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-4" data-testid="cart-incentives">
      {threshold && (
        <div className="flex gap-x-3">
          <span className="text-brand mt-0.5">
            {itemTotal >= threshold ? <CheckCircleSolid /> : <TruckFast />}
          </span>
          <div className="flex flex-col gap-y-2 flex-1 txt-small">
            <span className="text-ui-fg-base">
              {itemTotal >= threshold
                ? t("freeShippingReached")
                : t("freeShippingRemaining", {
                    amount: money(threshold - itemTotal),
                  })}
            </span>
            {itemTotal < threshold && (
              <ProgressBar value={(itemTotal / threshold) * 100} />
            )}
          </div>
        </div>
      )}
      {nextDiscount && (
        <div className="flex gap-x-3">
          <span className="text-brand mt-0.5">
            <ReceiptPercent />
          </span>
          <div className="flex flex-col gap-y-2 flex-1 txt-small">
            <span className="text-ui-fg-base">
              {t("discountRemaining", {
                amount: money(nextDiscount.min_total - valueBeforeDiscount),
                percent: nextDiscount.percent,
              })}
            </span>
            <ProgressBar
              value={(valueBeforeDiscount / nextDiscount.min_total) * 100}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default CartIncentives
