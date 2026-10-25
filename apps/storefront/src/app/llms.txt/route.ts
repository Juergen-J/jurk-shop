import { CONTACT_EMAIL, SHOP_NAME, SMALL_BUSINESS } from "@lib/constants"
import {
  SeoProduct,
  listSeoCategories,
  listSeoProducts,
  shopUrl,
} from "@lib/data/seo"
import { convertToLocale } from "@lib/util/money"

// Generated per request from the live catalog (fetches cached for an hour)
export const dynamic = "force-dynamic"

const productLine = (p: SeoProduct) => {
  const price =
    p.minPrice !== null && p.currency
      ? `ab ${convertToLocale({ amount: p.minPrice, currency_code: p.currency })}`
      : "Preis auf Anfrage"
  return `- [${p.title}](${shopUrl(`/products/${p.handle}`)}): ${price}`
}

/**
 * llms.txt (llmstxt.org): a Markdown summary of the shop for language models,
 * with the facts a customer asks about and links to every product.
 */
export async function GET() {
  const [products, categories] = await Promise.all([
    listSeoProducts().catch(() => []),
    listSeoCategories().catch(() => []),
  ])

  const sections = categories
    .map((c) => {
      const items = products.filter((p) => p.categoryIds.includes(c.id))
      return items.length
        ? `## ${c.name}\n\nKategorie: ${shopUrl(`/categories/${c.handle}`)}\n\n${items.map(productLine).join("\n")}`
        : null
    })
    .filter(Boolean)

  const uncategorized = products.filter((p) => !p.categoryIds.length)
  if (uncategorized.length) {
    sections.push(`## Weitere Produkte\n\n${uncategorized.map(productLine).join("\n")}`)
  }

  const body = `# ${SHOP_NAME}

> Online-Shop für 3D-gedruckte Munitionsboxen (Patronenboxen) für viele Kaliber, jede Box wird nach der Bestellung in Deutschland gedruckt. Verkauf und Versand nur innerhalb Deutschlands, Preise in Euro.

- Fertigung: gedruckt nach Bestellung ab Zahlungseingang, Dauer je nach Stückzahl (auf der Produktseite angegeben); jede Patrone sitzt in einem eigenen Fach
- Versand: mit DHL innerhalb Deutschlands, Zustellung meist in 1–2 Werktagen nach der Fertigung
- Farben: Standardfarben je Produkt, andere Farben auf Anfrage
- Preise: ${SMALL_BUSINESS ? "Endpreise, gemäß § 19 UStG ohne Umsatzsteuer" : "inkl. MwSt."}, zzgl. Versand
- Widerruf: 14 Tage Widerrufsrecht
- Kontakt: ${CONTACT_EMAIL}
- Sprachen: Deutsch, Englisch (Umschaltung im Shop)

## Shop-Informationen

- [Alle Produkte](${shopUrl()})
- [Versand & Zahlung](${shopUrl("/versand-zahlung")})
- [AGB](${shopUrl("/agb")})
- [Widerrufsbelehrung](${shopUrl("/widerrufsbelehrung")})
- [Impressum](${shopUrl("/impressum")})

${sections.join("\n\n")}
`

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
