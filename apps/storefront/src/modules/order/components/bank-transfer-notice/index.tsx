import { isManual } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"
import { getShopSettings } from "@lib/data/shop-settings"

const BankTransferNotice = async ({ order }: { order: HttpTypes.StoreOrder }) => {
  const providerId =
    order.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id ??
    order.payment_collections?.[0]?.payments?.[0]?.provider_id

  if (!isManual(providerId)) {
    return null
  }

  const t = await getTranslations("bankTransfer")
  // Bank details are edited in the admin (Settings > Store).
  const { bank: BANK, invoice_separately } = await getShopSettings()
  const amount = convertToLocale({
    amount: order.total,
    currency_code: order.currency_code,
  })

  // The invoice (bank details, QR code) is sent separately, e.g. from Lexware.
  if (invoice_separately) {
    return (
      <div
        className="rounded-2xl border border-brand/30 bg-brand/5 p-6 flex flex-col gap-y-3"
        data-testid="bank-transfer-notice"
      >
        <h2 className="txt-large-plus text-ui-fg-base">{t("invoiceTitle")}</h2>
        <p className="txt-medium text-ui-fg-subtle">{t("invoiceText", { amount })}</p>
        <p className="txt-small text-ui-fg-muted">{t("productionStart")}</p>
      </div>
    )
  }
  const reference = t("referenceValue", { number: order.display_id ?? "" })

  const rows = [
    { label: t("holder"), value: BANK.holder },
    { label: t("iban"), value: BANK.iban },
    { label: t("bic"), value: BANK.bic },
    { label: t("bank"), value: BANK.name },
    { label: t("amount"), value: amount },
    { label: t("reference"), value: reference },
  ].filter((row) => row.value)

  return (
    <div
      className="rounded-2xl border border-brand/30 bg-brand/5 p-6 flex flex-col gap-y-3"
      data-testid="bank-transfer-notice"
    >
      <h2 className="txt-large-plus text-ui-fg-base">{t("title")}</h2>
      <p className="txt-medium text-ui-fg-subtle">
        {t(BANK.iban ? "text" : "textNoBank", { amount, reference })}
      </p>
      {BANK.iban ? (
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 txt-medium">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-ui-fg-subtle">{row.label}</dt>
              <dd className="text-ui-fg-base font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="txt-medium text-ui-fg-subtle">{t("byEmail")}</p>
      )}
      <p className="txt-small text-ui-fg-muted">{t("productionStart")}</p>
    </div>
  )
}

export default BankTransferNotice
