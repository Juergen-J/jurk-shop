import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SHOP_NAME } from "@lib/constants"
import WithdrawalForm from "@modules/legal/components/withdrawal-form"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("withdrawal")
  return { title: `${t("title")} | ${SHOP_NAME}` }
}

export default async function WithdrawalPage() {
  const t = await getTranslations("withdrawal")

  return (
    <div className="content-container py-12 small:py-16">
      <div className="max-w-xl">
        <h1 className="text-3xl leading-10 mb-3 text-ui-fg-base">{t("title")}</h1>
        <p className="txt-medium text-ui-fg-subtle mb-8">{t("intro")}</p>
        <WithdrawalForm />
      </div>
    </div>
  )
}
