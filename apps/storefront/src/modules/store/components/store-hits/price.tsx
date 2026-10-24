"use client"

import { indexedCurrency, priceAttribute } from "@lib/search-client"
import { convertToLocale } from "@lib/util/money"
import { Text, clx } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"

/** The per-currency price fields a hit may carry, e.g. `min_price_eur`. */
export type HitPricing = Record<string, unknown>

type HitPriceProps = {
  hit: HitPricing
  currencyCode: string
}

const amount = (value: unknown) => (typeof value === "number" ? value : null)

const HitPrice = ({ hit, currencyCode }: HitPriceProps) => {
  const t = useTranslations("product")
  const currency_code = indexedCurrency(currencyCode)
  const min_price = amount(hit[priceAttribute("min_price", currencyCode)])
  const max_price = amount(hit[priceAttribute("max_price", currencyCode)])
  const original_price = amount(
    hit[priceAttribute("original_price", currencyCode)]
  )
  const on_sale = hit[priceAttribute("on_sale", currencyCode)] === true

  if (min_price === null) {
    return (
      <Text className="text-ui-fg-muted" data-testid="price">
        {t("priceOnRequest")}
      </Text>
    )
  }

  const format = (value: number) =>
    convertToLocale({ amount: value, currency_code })

  const max = max_price ?? min_price
  const isRange = max > min_price

  return (
    <div
      className="flex flex-wrap items-baseline gap-x-2 tabular-nums"
      data-testid="product-price"
    >
      {!isRange && on_sale && original_price !== null && (
        <Text
          className="line-through text-ui-fg-muted whitespace-nowrap"
          data-testid="original-price"
        >
          {format(original_price)}
        </Text>
      )}
      <Text
        className={clx("text-ui-fg-muted whitespace-nowrap", {
          "text-ui-tag-red-text": on_sale,
        })}
        data-testid="price"
      >
        {/* "ab 12,50 €" instead of a range: a range doesn't fit a phone column */}
        {isRange ? `${t("from")} ${format(min_price)}` : format(min_price)}
      </Text>
    </div>
  )
}

export default HitPrice
