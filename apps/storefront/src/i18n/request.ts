import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { DEFAULT_LOCALE, LOCALES } from "./config"

/**
 * The UI language follows the same cookie the Medusa locale actions set, so
 * product content and interface text always switch together.
 */
export default getRequestConfig(async () => {
  const cookie = (await cookies()).get("_medusa_locale")?.value
  const locale =
    LOCALES.find((l) => cookie?.toLowerCase().startsWith(l.code))?.code ??
    DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
