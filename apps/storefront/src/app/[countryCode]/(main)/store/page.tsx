import { permanentRedirect } from "next/navigation"

/** The catalog moved to the home page; keep old links working. */
export default async function StorePage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { countryCode } = await props.params
  const query = new URLSearchParams(await props.searchParams).toString()
  permanentRedirect(`/${countryCode}${query ? `?${query}` : ""}`)
}
