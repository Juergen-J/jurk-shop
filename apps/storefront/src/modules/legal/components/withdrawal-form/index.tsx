"use client"

import {
  submitWithdrawal,
  WithdrawalInput,
  WithdrawalReceipt,
} from "@lib/data/withdrawal"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useLocale, useTranslations } from "next-intl"
import { FormEvent, useState } from "react"

type Step = "form" | "confirm" | "done"

/**
 * Online withdrawal function (§ 356a BGB): enter the declaration, then confirm
 * it with a second, separately labelled button. Usable without an account.
 */
const WithdrawalForm = () => {
  const t = useTranslations("withdrawal")
  const locale = useLocale()
  const [step, setStep] = useState<Step>("form")
  const [data, setData] = useState<WithdrawalInput>({
    name: "",
    email: "",
    order_number: "",
    items: "",
  })
  const [receipt, setReceipt] = useState<WithdrawalReceipt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof WithdrawalInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData({ ...data, [field]: e.target.value })

  const toConfirm = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setStep("confirm")
  }

  const confirm = async () => {
    setSubmitting(true)
    setError(null)

    const { receipt, error } = await submitWithdrawal({
      ...data,
      items: data.items?.trim() || undefined,
    })

    setSubmitting(false)

    if (error || !receipt) {
      setError(t("error"))
      return
    }

    setReceipt(receipt)
    setStep("done")
  }

  if (step === "done" && receipt) {
    const receivedAt = new Intl.DateTimeFormat(
      locale === "en" ? "en-GB" : "de-DE",
      { dateStyle: "long", timeStyle: "medium", timeZone: "Europe/Berlin" }
    ).format(new Date(receipt.received_at))

    return (
      <div
        className="flex flex-col gap-y-4 rounded-2xl border border-brand/30 bg-brand/5 p-6"
        data-testid="withdrawal-received"
      >
        <div className="flex items-center gap-x-2 text-ui-fg-base txt-large-plus">
          <span className="text-brand">
            <CheckCircleSolid />
          </span>
          {t("receivedTitle")}
        </div>
        <p className="txt-medium text-ui-fg-subtle">
          {t("receivedText", { date: receivedAt, email: receipt.email })}
        </p>
        <Summary data={receipt} />
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="flex flex-col gap-y-6" data-testid="withdrawal-confirm">
        <p className="txt-medium text-ui-fg-base">{t("confirmText")}</p>
        <div className="rounded-2xl border border-ui-border-base p-6">
          <Summary data={data} />
        </div>
        <ErrorMessage error={error} />
        <div className="flex flex-col-reverse gap-3 xsmall:flex-row">
          <Button
            variant="secondary"
            size="large"
            onClick={() => setStep("form")}
            disabled={submitting}
          >
            {t("back")}
          </Button>
          <Button
            size="large"
            onClick={confirm}
            isLoading={submitting}
            data-testid="withdrawal-confirm-button"
          >
            {t("confirmButton")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={toConfirm} className="flex flex-col gap-y-4">
      <Input
        label={t("name")}
        name="name"
        autoComplete="name"
        required
        value={data.name}
        onChange={update("name")}
      />
      <Input
        label={t("email")}
        name="email"
        type="email"
        autoComplete="email"
        required
        value={data.email}
        onChange={update("email")}
      />
      <Input
        label={t("orderNumber")}
        name="order_number"
        required
        value={data.order_number}
        onChange={update("order_number")}
      />
      <label className="flex flex-col gap-y-1">
        <span className="txt-compact-small text-ui-fg-subtle">{t("items")}</span>
        <textarea
          name="items"
          rows={3}
          value={data.items}
          onChange={update("items")}
          placeholder={t("itemsPlaceholder")}
          className="rounded-md border border-ui-border-base bg-ui-bg-field px-4 py-2 txt-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <p className="txt-small text-ui-fg-muted">{t("hint")}</p>
      <Button type="submit" size="large" className="self-start" data-testid="withdrawal-button">
        {t("button")}
      </Button>
    </form>
  )
}

const Summary = ({
  data,
}: {
  data: Pick<WithdrawalInput, "name" | "email" | "order_number"> & {
    items?: string | null
  }
}) => {
  const t = useTranslations("withdrawal")

  const rows = [
    [t("name"), data.name],
    [t("email"), data.email],
    [t("orderNumber"), data.order_number],
    [t("itemsShort"), data.items?.trim() || t("allItems")],
  ]

  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1 txt-medium">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ui-fg-subtle">{label}</dt>
          <dd className="text-ui-fg-base break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default WithdrawalForm
