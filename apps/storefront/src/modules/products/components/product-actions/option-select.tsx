import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import ChevronDown from "@modules/common/icons/chevron-down"
import { useTranslations } from "next-intl"
import React, { useId } from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

// Numeric-aware so that "25 Schuss" < "50 Schuss" < "100 Schuss".
const collator = new Intl.Collator("de", { numeric: true })

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const t = useTranslations("product")
  const id = useId()
  const values = (option.values ?? [])
    .map((v) => v.value)
    .sort((a, b) => collator.compare(a, b))

  return (
    <div className="flex flex-col gap-y-2">
      <label htmlFor={id} className="txt-compact-small-plus text-ui-fg-base">
        {title}
      </label>
      <div className="relative">
        <select
          id={id}
          value={current ?? ""}
          onChange={(e) => updateOption(option.id, e.target.value)}
          disabled={disabled}
          data-testid={dataTestId}
          className={clx(
            "w-full appearance-none rounded-lg border border-ui-border-base bg-white px-4 h-11 pr-10 txt-compact-medium outline-none transition-colors",
            "hover:border-ui-border-strong focus:border-brand focus:ring-2 focus:ring-brand/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            { "text-ui-fg-muted": !current }
          )}
        >
          <option value="" disabled>
            {t("choose", { option: title })}
          </option>
          {values.map((v) => (
            <option key={v} value={v} className="text-ui-fg-base">
              {v}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ui-fg-subtle">
          <ChevronDown size={16} />
        </span>
      </div>
    </div>
  )
}

export default OptionSelect
