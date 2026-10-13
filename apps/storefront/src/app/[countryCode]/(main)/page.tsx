import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { getRegion } from "@lib/data/regions"
import { SHOP_NAME } from "@lib/constants"
import StoreTemplate from "@modules/store/templates"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ page?: string; q?: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const t = await getTranslations("home")
  const { q } = await props.searchParams
  return {
    title: `${SHOP_NAME} | ${t("metaTitle")}`,
    description: t("metaDescription"),
    // Search results are not worth indexing.
    ...(q ? { robots: { index: false } } : {}),
  }
}

/** The home page is the catalog. */
export default async function Home(props: Props) {
  const { countryCode } = await props.params
  const { page, q } = await props.searchParams
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  return (
    <StoreTemplate
      countryCode={countryCode}
      page={page}
      q={q?.trim() || undefined}
    />
  )
}
