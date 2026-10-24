import { HttpTypes } from "@medusajs/types"
import { ProductHit } from "@modules/store/components/store-hits/hit-card"

// Worst-case data for the catalog card and the cart, built from the real
// catalog: the longest title (.280 Ackley Improved), the longest option values
// and up to 33 variants per product. Dev-only, see page.tsx.

const IMG = "http://localhost:9000/static/"
const THUMBS = [
  `${IMG}1791886778092-munitionsbox-300-win-mag-2577860.jpg`,
  `${IMG}1791886774351-munitionsbox-38-special-2113668.jpg`,
  `${IMG}1791886775991-munitionsbox-22-lr-1986888.jpg`,
]

export type DataSet = "demo" | "worst" | "one" | "empty"

const hit = (
  i: number,
  title: string | null,
  min: number | null,
  max?: number,
  sale?: { original: number },
  thumbnail: string | null = THUMBS[i % THUMBS.length]
): ProductHit =>
  ({
    objectID: `hit_${i}`,
    __position: i + 1,
    title,
    handle: `fixture-${i}`,
    thumbnail,
    min_price_eur: min,
    max_price_eur: max ?? min,
    original_price_eur: sale?.original ?? null,
    on_sale_eur: !!sale,
  }) as unknown as ProductHit

const DEMO_HITS = [
  hit(0, "Munitionsbox 9mm Luger", 12),
  hit(1, "Munitionsbox .38 Special", 14),
  hit(2, "Munitionsbox .22 LR", 9),
  hit(3, "Munitionsbox 7.62x39", 16),
]

const WORST_HITS = [
  // Longest real title, and a variant price range (BoxLoc sizes from 25 to 100+8)
  hit(0, "Munitionsbox .280 Ackley Improved", 12.5, 148),
  // Plausible next import: two calibers in one title, no break opportunity in "6.5x55"
  hit(1, "Munitionsbox 6.5x55 Swedish Mauser / .260 Remington", 1249, 1999),
  // On sale: strike-through price plus current price on one line
  hit(2, "Munitionsbox .30-06 Springfield", 18.9, undefined, { original: 24.9 }),
  // Missing thumbnail and a short title
  hit(3, "Munitionsbox .45", 9.5, undefined, undefined, null),
  // No price indexed yet (new product)
  hit(4, "Munitionsbox .410/76 Schrot", null),
  // Title missing entirely
  hit(5, null, 12),
]

export const hitsFor = (data: DataSet) =>
  data === "worst"
    ? WORST_HITS
    : data === "one"
      ? DEMO_HITS.slice(0, 1)
      : data === "empty"
        ? []
        : DEMO_HITS

const item = (
  i: number,
  title: string,
  options: [string, string][],
  quantity: number,
  unit: number,
  extra: Partial<HttpTypes.StoreCartLineItem> = {}
): HttpTypes.StoreCartLineItem =>
  ({
    id: `item_${i}`,
    created_at: new Date(2026, 9, 24, 12, 0, 60 - i).toISOString(),
    product_title: title,
    product_handle: `fixture-${i}`,
    thumbnail: THUMBS[i % THUMBS.length],
    quantity,
    total: unit * quantity,
    original_total: unit * quantity,
    metadata: null,
    variant: {
      id: `variant_${i}`,
      title: options.map(([, v]) => v).join(" / "),
      options: options.map(([t, v], j) => ({
        id: `opt_${i}_${j}`,
        value: v,
        option: { title: t },
      })),
    },
    ...extra,
  }) as unknown as HttpTypes.StoreCartLineItem

const DEMO_ITEMS = [
  item(0, "Munitionsbox 9mm Luger", [["Kaliber", "9mm Luger"], ["Farbe", "Schwarz"], ["Größe", "50 Schuss"]], 2, 12),
  item(1, "Munitionsbox .22 LR", [["Kaliber", ".22 LR"], ["Farbe", "Oliv"], ["Größe", "100 Schuss"]], 1, 9),
]

const WORST_ITEMS = [
  // Longest real title and option values, bought in bulk past the 20 in the select
  item(0, "Munitionsbox .280 Ackley Improved", [["Kaliber", ".280 Ackley Improved"], ["Farbe", "Andere Farbe (nach Anfrage)"], ["Größe", "100+8 Schuss (Doppel Kompakt)"]], 25, 14.9, {
    metadata: { requested_color: "RAL 6003 Olivgrün, Deckel in Signalorange" },
  }),
  // Volume discount applied: original and reduced price
  item(1, "Munitionsbox 6.5x55 Swedish Mauser / .260 Remington", [["Kaliber", "6.5x55 Swedish Mauser"], ["Farbe", "Wüstenbraun / Schwarz"], ["Größe", "72 Patronen, .410/76"]], 12, 1249, {
    original_total: 1249 * 12 * 1.1,
  }),
  // Options not loaded: falls back to the variant title
  item(2, "Munitionsbox .45", [], 1, 9.5, {
    variant: { id: "variant_2", title: "Default", options: [] } as unknown as HttpTypes.StoreProductVariant,
  }),
]

export const cartFor = (data: DataSet): HttpTypes.StoreCart =>
  ({
    id: "cart_fixture",
    currency_code: "eur",
    items:
      data === "worst"
        ? WORST_ITEMS
        : data === "one"
          ? DEMO_ITEMS.slice(0, 1)
          : data === "empty"
            ? []
            : DEMO_ITEMS,
  }) as unknown as HttpTypes.StoreCart
