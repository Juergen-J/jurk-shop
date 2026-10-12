import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"

import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"
import { HttpTypes } from "@medusajs/types"
import { useLocale, useTranslations } from "next-intl"

const CountrySelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps & {
    region?: HttpTypes.StoreRegion
  }
>(({ placeholder, region, defaultValue, ...props }, ref) => {
  const innerRef = useRef<HTMLSelectElement>(null)
  const locale = useLocale()
  const t = useTranslations("address")

  useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
    ref,
    () => innerRef.current
  )

  const countryOptions = useMemo(() => {
    if (!region) {
      return []
    }

    const names = new Intl.DisplayNames([locale], { type: "region" })

    return region.countries?.map((country) => ({
      value: country.iso_2,
      label:
        (country.iso_2 && names.of(country.iso_2.toUpperCase())) ||
        country.display_name,
    }))
  }, [region, locale])

  return (
    <NativeSelect
      ref={innerRef}
      placeholder={placeholder ?? t("country")}
      defaultValue={defaultValue}
      {...props}
    >
      {countryOptions?.map(({ value, label }, index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </NativeSelect>
  )
})

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
