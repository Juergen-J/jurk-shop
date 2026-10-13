"use client"

import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  /** Line item metadata; shows the requested colors if there are any. */
  metadata?: Record<string, unknown> | null
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

/**
 * Lists the chosen options ("Kaliber: 9mm Luger") so they follow the selected
 * language. Falls back to the variant title when options aren't loaded.
 */
const LineItemOptions = ({
  variant,
  metadata,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const t = useTranslations("product.colorNote")
  const options = (variant?.options ?? []).filter((o) => o.option?.title)
  const requestedColor =
    typeof metadata?.requested_color === "string" ? metadata.requested_color : null

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="flex flex-col txt-small text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
    >
      {options.length
        ? options.map((o) => (
            <span key={o.id}>
              {o.option?.title}: {o.value}
            </span>
          ))
        : variant?.title}
      {requestedColor && (
        <span>
          {t("lineItem")}: {requestedColor}
        </span>
      )}
    </Text>
  )
}

export default LineItemOptions
