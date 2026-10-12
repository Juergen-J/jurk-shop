"use client"

import { updateLocale } from "@lib/data/locale-actions"
import { clx } from "@modules/common/components/ui"
import { LOCALES } from "../../../../i18n/config"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

const LanguageSwitch = ({ className }: { className?: string }) => {
  const t = useTranslations("nav")
  const current = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const switchTo = (medusaCode: string) => {
    startTransition(async () => {
      await updateLocale(medusaCode)
      router.refresh()
    })
  }

  return (
    <div
      className={clx("flex items-center gap-x-1", className)}
      aria-label={t("language")}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale.code}
          onClick={() => switchTo(locale.medusaCode)}
          disabled={isPending || locale.code === current}
          className={clx(
            "px-2 py-1 rounded-md txt-compact-small-plus transition-colors",
            locale.code === current
              ? "bg-ui-bg-subtle text-ui-fg-base"
              : "text-ui-fg-subtle hover:text-ui-fg-base"
          )}
          data-testid={`language-${locale.code}`}
        >
          {locale.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitch
