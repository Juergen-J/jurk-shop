import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { getShopSettings } from "@lib/data/shop-settings"
import { SHOP_NAME, SMALL_BUSINESS } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shippingPayment")
  return { title: `${t("title")} | ${SHOP_NAME}` }
}

const money = (amount: number) =>
  convertToLocale({ amount, currency_code: "eur" })

export default async function ShippingPaymentPage() {
  const t = await getTranslations("shippingPayment")
  const tProduction = await getTranslations("production")
  const settings = await getShopSettings()

  const days = (min: number, max: number) =>
    min === max
      ? tProduction("days", { count: min })
      : tProduction("daysRange", { min, max })

  const tiers = settings.production_tiers

  return (
    <article className="content-container py-12 small:py-16">
      <div className="max-w-3xl flex flex-col gap-y-3 txt-medium text-ui-fg-subtle">
        <h1 className="text-3xl leading-10 mb-5 text-ui-fg-base">{t("title")}</h1>

        <h2 className="txt-xlarge-plus text-ui-fg-base mt-4">{t("deliveryTitle")}</h2>
        <p>{t(SMALL_BUSINESS ? "deliveryAreaSmallBusiness" : "deliveryArea")}</p>
        <ul className="list-disc pl-6">
          {settings.shipping_options.map((option) => (
            <li key={option.name}>
              {option.name}:{" "}
              {option.amount === null ? "-" : money(option.amount)}
            </li>
          ))}
        </ul>
        {settings.free_shipping_threshold && (
          <p>{t("freeShipping", { amount: money(settings.free_shipping_threshold) })}</p>
        )}

        <h2 className="txt-xlarge-plus text-ui-fg-base mt-4">{t("timeTitle")}</h2>
        <p>{t("timeText")}</p>
        {tiers.length > 0 && (
          <ul className="list-disc pl-6">
            {tiers.map((tier, index) => {
              const from = index === 0 ? 1 : (tiers[index - 1].max ?? 0) + 1
              const label =
                tier.max === null
                  ? tProduction("tierFrom", { from })
                  : from === tier.max
                  ? tProduction("tierExact", { count: from })
                  : tProduction("tierRange", { from, to: tier.max })

              return (
                <li key={index}>
                  {label}: {days(tier.min_days, tier.max_days)}
                </li>
              )
            })}
          </ul>
        )}
        <p>{t("deliveryTime")}</p>

        {settings.volume_discounts.length > 0 && (
          <>
            <h2 className="txt-xlarge-plus text-ui-fg-base mt-4">{t("discountTitle")}</h2>
            <ul className="list-disc pl-6">
              {settings.volume_discounts.map((d) => (
                <li key={d.min_total}>
                  {t("discountTier", { amount: money(d.min_total), percent: d.percent })}
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="txt-xlarge-plus text-ui-fg-base mt-4">{t("paymentTitle")}</h2>
        <p>{t(settings.invoice_separately ? "paymentTextInvoice" : "paymentText")}</p>

        {SMALL_BUSINESS && (
          <>
            <h2 className="txt-xlarge-plus text-ui-fg-base mt-4">{t("vatTitle")}</h2>
            <p>{t("vatSmallBusiness")}</p>
          </>
        )}

        <h2 className="txt-xlarge-plus text-ui-fg-base mt-4">{t("returnsTitle")}</h2>
        <p>
          {t.rich("returnsText", {
            policy: (chunks) => (
              <LocalizedClientLink href="/widerrufsbelehrung" className="text-ui-fg-interactive hover:underline">
                {chunks}
              </LocalizedClientLink>
            ),
            withdraw: (chunks) => (
              <LocalizedClientLink href="/widerruf" className="text-ui-fg-interactive hover:underline">
                {chunks}
              </LocalizedClientLink>
            ),
          })}
        </p>
      </div>
    </article>
  )
}
