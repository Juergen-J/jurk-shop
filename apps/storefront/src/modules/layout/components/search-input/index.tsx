"use client"

import { MagnifyingGlass, XMarkMini } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

/**
 * Product search. Submitting opens the catalog (the home page) with `?q=`,
 * which the product list passes on to Medusa's full-text search.
 */
const SearchInput = ({
  className,
  onSearch,
}: {
  className?: string
  onSearch?: () => void
}) => {
  const t = useTranslations("search")
  const router = useRouter()
  const { countryCode } = useParams()
  const query = useSearchParams().get("q") ?? ""
  const [value, setValue] = useState(query)

  // Follow the URL, e.g. after navigating to a category or back.
  useEffect(() => setValue(query), [query])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const q = value.trim()
    router.push(q ? `/${countryCode}?q=${encodeURIComponent(q)}` : `/${countryCode}`)
    onSearch?.()
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={clx(
        "relative flex items-center rounded-full border border-ui-border-base bg-ui-bg-field transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20",
        className
      )}
    >
      <MagnifyingGlass className="absolute left-3 text-ui-fg-muted" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("label")}
        className="h-10 w-full rounded-full bg-transparent pl-10 pr-9 txt-compact-medium text-ui-fg-base outline-none placeholder:text-ui-fg-muted [&::-webkit-search-cancel-button]:hidden"
        data-testid="search-input"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label={t("clear")}
          className="absolute right-3 text-ui-fg-muted hover:text-ui-fg-base"
        >
          <XMarkMini />
        </button>
      )}
    </form>
  )
}

export default SearchInput
