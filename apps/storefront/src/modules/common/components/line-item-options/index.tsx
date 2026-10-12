import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

/**
 * Lists the chosen options ("Kaliber: 9mm Luger") so they follow the selected
 * language. Falls back to the variant title when options aren't loaded.
 */
const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const options = (variant?.options ?? []).filter((o) => o.option?.title)

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
    </Text>
  )
}

export default LineItemOptions
