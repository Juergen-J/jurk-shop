"use client"

import { convertToLocale } from "@lib/util/money"
import { useTranslations } from "next-intl"
import { SMALL_BUSINESS } from "@lib/constants"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    tax_total?: number | null
    currency_code: string
    item_total?: number | null
    shipping_total?: number | null
    discount_total?: number | null
  }
}

/**
 * Prices are final prices. With VAT (not a Kleinunternehmer) the included VAT
 * is listed below the total, otherwise the § 19 UStG note.
 */
const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const t = useTranslations("totals")
  const {
    currency_code,
    total,
    tax_total,
    item_total,
    shipping_total,
    discount_total,
  } = totals
  const subtotal = (item_total ?? 0) + (discount_total ?? 0)

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span>{t("subtotal")}</span>
          <span data-testid="cart-subtotal" data-value={subtotal}>
            {convertToLocale({ amount: subtotal, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("shipping")}</span>
          <span data-testid="cart-shipping" data-value={shipping_total || 0}>
            {convertToLocale({ amount: shipping_total ?? 0, currency_code })}
          </span>
        </div>
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span>{t("discount")}</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_total ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base txt-medium ">
        <span>{t("total")}</span>
        <span
          className="txt-xlarge-plus"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      {SMALL_BUSINESS ? (
        <p className="txt-small text-ui-fg-muted mt-1">
          {t("smallBusinessNote")}
        </p>
      ) : (
        <div className="flex items-center justify-between txt-small text-ui-fg-muted mt-1">
          <span>{t("includedVat")}</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            {convertToLocale({ amount: tax_total ?? 0, currency_code })}
          </span>
        </div>
      )}
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
