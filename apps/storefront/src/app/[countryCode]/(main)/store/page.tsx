import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getRegion } from "@lib/data/regions"
import { SHOP_NAME } from "@lib/constants"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("store")
  return {
    title: `${t("title")} | ${SHOP_NAME}`,
    description: t("description"),
  }
}

export default async function StorePage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { countryCode } = await props.params
  const { page } = await props.searchParams
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  return <StoreTemplate countryCode={countryCode} page={page} />
}
