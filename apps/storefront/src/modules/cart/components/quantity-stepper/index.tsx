"use client"

import { clx } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

const MAX_QUANTITY = 999

type QuantityStepperProps = {
  value: number
  onChange: (quantity: number) => void
  disabled?: boolean
  "data-testid"?: string
}

/**
 * − [n] + for a cart line. Any quantity fits (bulk orders of 25+ boxes are
 * normal); the field commits on blur or Enter, the buttons right away.
 */
const QuantityStepper = ({
  value,
  onChange,
  disabled,
  "data-testid": dataTestId,
}: QuantityStepperProps) => {
  const t = useTranslations("cart")
  const [draft, setDraft] = useState(String(value))

  useEffect(() => setDraft(String(value)), [value])

  const commit = (next: number) => {
    const clamped = Math.min(MAX_QUANTITY, Math.max(1, next))
    setDraft(String(clamped))
    if (clamped !== value) {
      onChange(clamped)
    }
  }

  const commitDraft = () => {
    const parsed = parseInt(draft, 10)
    if (Number.isNaN(parsed)) {
      setDraft(String(value))
      return
    }
    commit(parsed)
  }

  const stepClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-ui-fg-base transition-[background-color,transform] duration-150 ease-out-strong hover:bg-gray-200 active:scale-[0.92] disabled:text-ui-fg-disabled disabled:active:scale-100"

  return (
    <div
      className={clx(
        "inline-flex items-center rounded-full bg-gray-100 tabular-nums",
        { "opacity-60": disabled }
      )}
    >
      <button
        type="button"
        className={stepClass}
        onClick={() => commit(value - 1)}
        disabled={disabled || value <= 1}
        aria-label={t("decrease")}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        className="h-10 w-10 bg-transparent text-center txt-compact-small text-ui-fg-base outline-none"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={commitDraft}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        disabled={disabled}
        aria-label={t("quantity")}
        data-testid={dataTestId}
      />
      <button
        type="button"
        className={stepClass}
        onClick={() => commit(value + 1)}
        disabled={disabled || value >= MAX_QUANTITY}
        aria-label={t("increase")}
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
