import { ShopSettings } from "@lib/data/shop-settings"
import { convertToLocale } from "@lib/util/money"
import { ReceiptPercent, TruckFast } from "@medusajs/icons"
import { useTranslations } from "next-intl"

/** Free shipping and volume discount conditions, shown on the product page. */
const ShopPerks = ({ settings }: { settings: ShopSettings }) => {
  const t = useTranslations("incentives")
  const money = (amount: number) =>
    convertToLocale({ amount, currency_code: "eur", maximumFractionDigits: 0 })

  const { free_shipping_threshold: threshold, volume_discounts: discounts } =
    settings

  if (!threshold && !discounts.length) {
    return null
  }

  return (
    <ul className="flex flex-col gap-y-2 txt-small text-ui-fg-subtle">
      {threshold && (
        <li className="flex items-center gap-x-2">
          <span className="text-brand">
            <TruckFast />
          </span>
          {t("freeShippingFrom", { amount: money(threshold) })}
        </li>
      )}
      {discounts.length > 0 && (
        <li className="flex items-start gap-x-2">
          <span className="text-brand">
            <ReceiptPercent />
          </span>
          <span>
            {t("volumeDiscount")}{" "}
            {discounts
              .map((d) =>
                t("discountTier", { amount: money(d.min_total), percent: d.percent })
              )
              .join(", ")}
          </span>
        </li>
      )}
    </ul>
  )
}

export default ShopPerks
