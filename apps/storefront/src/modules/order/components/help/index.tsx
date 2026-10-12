import { Heading } from "@modules/common/components/ui"
import { useTranslations } from "next-intl"
import { CONTACT_EMAIL } from "@lib/constants"
import React from "react"

const Help = () => {
  const t = useTranslations("order")

  return (
    <div className="mt-6">
      <Heading className="text-base-semi">{t("help")}</Heading>
      <div className="text-base-regular my-2 text-ui-fg-subtle">
        {t("helpText")}{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </div>
  )
}

export default Help
