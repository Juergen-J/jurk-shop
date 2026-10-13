#!/usr/bin/env node
/**
 * Syncs catalog/catalog.csv into Medusa through the Admin API:
 *
 *   node tools/catalog/import.mjs              # local backend
 *   MEDUSA_URL=https://api.jurk.pro MEDUSA_ADMIN_KEY=sk_... node tools/catalog/import.mjs
 *
 * Every product gets the variants "Ausführung" (one per CSV row) x "Farbe".
 * New products are created with German texts and English translations.
 * Existing products (same handle) keep their texts and images; their variants
 * are brought in line with the CSV: missing ones are added, ones no longer in
 * the CSV are deleted. Prices: preis_eur from the CSV if set, otherwise new
 * variants get PLACEHOLDER_PRICE and existing prices stay as they are.
 * Products that are not in the CSV are left alone.
 *
 * Options:
 *   --dry-run        only print what would change
 *   --update-texts   also overwrite title, subtitle and description (DE + EN)
 *                    of existing products with the catalog texts
 */
import { adminClient, groupProducts, readCatalog } from "./lib.mjs"

const LOCALE = "en-US"
const PLACEHOLDER_PRICE = 1
const DRY_RUN = process.argv.includes("--dry-run")
const UPDATE_TEXTS = process.argv.includes("--update-texts")

const PARENT_CATEGORY = { handle: "munitionsboxen", name: "Munitionsboxen", en: "Ammo Boxes" }
const CATEGORIES = {
  Kurzwaffe: { handle: "kurzwaffe", en: "Handgun" },
  Kleinkaliber: { handle: "kleinkaliber", en: "Rimfire" },
  Langwaffe: { handle: "langwaffe", en: "Rifle" },
  Schrot: { handle: "schrot", en: "Shotgun" },
}

const SIZE_OPTION = { title: "Ausführung", en: "Size", rank: 0 }
const COLOR_OPTION = { title: "Farbe", en: "Color", rank: 1 }
/** Box / lettering. The insert is black unless the customer asks otherwise. */
const COLORS = [
  { value: "Wüstenbraun / Schwarz", en: "Desert tan / black" },
  { value: "Olivgrün / Weiß", en: "Olive green / white" },
]
export const ON_REQUEST_COLOR = { value: "Andere Farbe (nach Anfrage)", en: "Other color (on request)" }
const colorsFor = (row) =>
  row.farben === "nach_anfrage" ? [ON_REQUEST_COLOR] : [...COLORS, ON_REQUEST_COLOR]

const SUBTITLE = { de: "3D-gedruckt nach Bestellung", en: "3D printed to order" }
const caliberOf = (title) => title.replace(/^(Munitionsbox|Ammo Box)\s+/, "")
const description = (row) =>
  `Munitionsbox für ${caliberOf(row.produkt)}, jede Patrone sitzt in einem eigenen Fach. ` +
  `Die Box wird nach deiner Bestellung im 3D-Druck gefertigt: Box und Schrift in Wüstenbraun/Schwarz ` +
  `oder Olivgrün/Weiß, der Einsatz innen ist schwarz. Andere Farben auf Anfrage.`
const descriptionEn = (row) =>
  `Ammo box for ${caliberOf(row.produkt_en)}, every round sits in its own slot. ` +
  `The box is 3D printed after you order: box and lettering in desert tan/black or ` +
  `olive green/white, the insert is black. Other colors on request.`

/** Sizes in a stable global order: plain counts, then Kompakt, Mini, Tasche, editions. */
const FORMAT_ORDER = ["(Kompakt)", "(Doppel Kompakt)", "(Mini)", "(Tasche)", "Edition"]
const sizeSortKey = (value) => {
  const format = FORMAT_ORDER.findIndex((f) => value.includes(f)) + 1
  const count = parseInt(value, 10)
  return [format, Number.isNaN(count) ? 99999 : count, value]
}
const compareSizes = (a, b) => {
  const [x, y] = [sizeSortKey(a), sizeSortKey(b)]
  return x[0] - y[0] || x[1] - y[1] || x[2].localeCompare(y[2])
}

const toSkuPart = (value) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 16)

const api = await adminClient()
const log = (...args) => console.log(...args)
const write = async (path, init) => {
  if (DRY_RUN) {
    log(`  [dry-run] ${init.method ?? "POST"} ${path}`)
    return {}
  }
  return api(path, { method: "POST", ...init })
}

const rows = await readCatalog()
const products = groupProducts(rows)
log(`${api.baseUrl}: ${products.length} products, ${rows.length} sizes in catalog.csv`)

const translations = []
const translate = (reference, reference_id, fields) =>
  translations.push({ reference, reference_id, locale_code: LOCALE, translations: fields })

// --- Store context ---------------------------------------------------------
const { stores } = await api("/admin/stores?fields=id,default_sales_channel_id")
const salesChannelId = stores[0]?.default_sales_channel_id
const { shipping_profiles } = await api("/admin/shipping-profiles?fields=id")
const shippingProfileId = shipping_profiles[0]?.id

// --- Categories ------------------------------------------------------------
const { product_categories } = await api(
  "/admin/product-categories?fields=id,handle&limit=1000"
)
const categoryIds = new Map(product_categories.map((c) => [c.handle, c.id]))
const ensureCategory = async (handle, name, en, parentId, rank) => {
  if (categoryIds.has(handle)) return categoryIds.get(handle)
  log(`category ${name}: create`)
  const { product_category } = await write("/admin/product-categories", {
    body: { name, handle, is_active: true, parent_category_id: parentId, rank },
  })
  if (product_category) {
    categoryIds.set(handle, product_category.id)
    translate("product_category", product_category.id, { name: en })
  }
  return product_category?.id
}
const parentId = await ensureCategory(
  PARENT_CATEGORY.handle,
  PARENT_CATEGORY.name,
  PARENT_CATEGORY.en
)
let rank = 0
for (const [name, c] of Object.entries(CATEGORIES)) {
  await ensureCategory(c.handle, name, c.en, parentId, rank++)
}

// --- Shared options --------------------------------------------------------
const sizeValues = new Map(rows.map((r) => [r.ausfuehrung, r.ausfuehrung_en]))
const colorValues = new Map([...COLORS, ON_REQUEST_COLOR].map((c) => [c.value, c.en]))

const fetchOption = async (title) => {
  const { product_options } = await api(
    `/admin/product-options?title=${encodeURIComponent(title)}&fields=id,title,metadata,*values`
  )
  return product_options[0]
}

/**
 * Makes sure the shared option holds all `values` (ranked in `order`). Values
 * the catalog no longer uses stay until `pruneOption` runs at the end, so
 * existing variants keep working during the sync.
 */
const ensureOption = async (option, values, order) => {
  const ranks = Object.fromEntries(order.map((v, i) => [v, i]))
  let existing = await fetchOption(option.title)
  if (!existing) {
    log(`option ${option.title}: create with ${order.length} values`)
    await write("/admin/product-options", {
      body: { title: option.title, values: order, ranks, metadata: { rank: option.rank } },
    })
    existing = DRY_RUN ? { id: "dry", values: [] } : await fetchOption(option.title)
    translate("product_option", existing.id, { title: option.en })
  } else {
    const known = existing.values.map((v) => v.value)
    const missing = order.filter((v) => !known.includes(v))
    if (missing.length) log(`option ${option.title}: add ${missing.join(", ")}`)
    await write(`/admin/product-options/${existing.id}`, {
      body: {
        ...(missing.length ? { values: [...known, ...missing] } : {}),
        ranks: { ...Object.fromEntries(known.map((v) => [v, 9999])), ...ranks },
        metadata: { ...existing.metadata, rank: option.rank },
      },
    })
    if (!DRY_RUN) existing = await fetchOption(option.title)
  }
  return {
    id: existing.id,
    valueIds: new Map(existing.values.map((v) => [v.value, v.id])),
    values: existing.values,
  }
}

const sizeOption = await ensureOption(
  SIZE_OPTION,
  sizeValues,
  Array.from(sizeValues.keys()).sort(compareSizes)
)
const colorOption = await ensureOption(COLOR_OPTION, colorValues, Array.from(colorValues.keys()))

// --- Products --------------------------------------------------------------
const desiredVariants = (product) =>
  product.rows.flatMap((row) =>
    colorsFor(row).map((color) => ({ row, color: color.value }))
  )

const variantPayload = ({ row, color }) => ({
  title: `${row.ausfuehrung} / ${color}`,
  sku: `MB-${toSkuPart(caliberOf(row.produkt))}-${toSkuPart(row.ausfuehrung)}-${toSkuPart(color)}`,
  manage_inventory: false,
  ...(row.gewicht_g ? { weight: Number(row.gewicht_g) } : {}),
  metadata: {
    makerworld_id: Number(row.makerworld_id),
    // The storefront asks for the requested colors when this is set.
    ...(color === ON_REQUEST_COLOR.value ? { color_on_request: true } : {}),
  },
  options: { [SIZE_OPTION.title]: row.ausfuehrung, [COLOR_OPTION.title]: color },
  prices: [
    {
      currency_code: "eur",
      amount: row.preis_eur ? Number(row.preis_eur.replace(",", ".")) : PLACEHOLDER_PRICE,
    },
  ],
})

const usedSizeValues = new Set()
const usedColorValues = new Set()
let created = 0
let updated = 0

for (const product of products) {
  const first = product.rows[0]
  const categoryId = categoryIds.get(CATEGORIES[first.kategorie]?.handle)
  const variants = desiredVariants(product)
  const sizes = [...new Set(product.rows.map((r) => r.ausfuehrung))]
  const colors = [...new Set(variants.map((v) => v.color))]
  sizes.forEach((v) => usedSizeValues.add(v))
  colors.forEach((v) => usedColorValues.add(v))

  const { products: found } = await api(
    `/admin/products?handle=${product.handle}&fields=id,title,*options,*options.values,*variants,*variants.options,*variants.prices,*categories`
  )
  const existing = found[0]

  if (!existing) {
    log(`${product.handle}: create (${variants.length} variants)`)
    const res = await write("/admin/products", {
      body: {
        title: first.produkt,
        subtitle: SUBTITLE.de,
        description: description(first),
        handle: product.handle,
        status: "published",
        ...(categoryId ? { categories: [{ id: categoryId }] } : {}),
        ...(shippingProfileId ? { shipping_profile_id: shippingProfileId } : {}),
        ...(salesChannelId ? { sales_channels: [{ id: salesChannelId }] } : {}),
        metadata: { design: "BoxLoc by Layer51", ai_images: false },
        options: [
          { id: sizeOption.id, value_ids: sizes.map((v) => sizeOption.valueIds.get(v)) },
          { id: colorOption.id, value_ids: colors.map((v) => colorOption.valueIds.get(v)) },
        ],
        variants: variants.map(variantPayload),
      },
    })
    if (res.product) {
      translate("product", res.product.id, {
        title: first.produkt_en,
        subtitle: SUBTITLE.en,
        description: descriptionEn(first),
      })
    }
    created++
    continue
  }

  if (UPDATE_TEXTS) {
    log(`${product.handle}: update texts`)
    await write(`/admin/products/${existing.id}`, {
      body: { title: first.produkt, subtitle: SUBTITLE.de, description: description(first) },
    })
    const { translations: old } = await api(
      `/admin/translations?reference_id=${existing.id}&locale_code=${LOCALE}&fields=id`
    )
    const en = {
      title: first.produkt_en,
      subtitle: SUBTITLE.en,
      description: descriptionEn(first),
    }
    await write("/admin/translations/batch", {
      body: old.length
        ? { update: [{ id: old[0].id, translations: en }] }
        : {
            create: [
              { reference: "product", reference_id: existing.id, locale_code: LOCALE, translations: en },
            ],
          },
    })
  }

  // Existing product: link option values, then add/remove variants.
  const key = (size, color) => `${size}|${color}`
  const wanted = new Map(variants.map((v) => [key(v.row.ausfuehrung, v.color), v]))
  const current = new Map(
    existing.variants.map((v) => {
      const value = (option) => v.options.find((o) => o.option_id === option.id)?.value
      return [key(value(sizeOption), value(colorOption)), v]
    })
  )
  const toDelete = [...current].filter(([k]) => !wanted.has(k)).map(([, v]) => v.id)
  const toCreate = [...wanted].filter(([k]) => !current.has(k)).map(([, v]) => v)
  const toUpdate = [...wanted]
    .filter(([k]) => current.has(k))
    .map(([k, v]) => ({ variant: current.get(k), want: v }))
    .filter(({ variant, want }) => {
      const weight = want.row.gewicht_g ? Number(want.row.gewicht_g) : variant.weight
      const price = want.row.preis_eur ? Number(want.row.preis_eur.replace(",", ".")) : null
      const eur = variant.prices?.find((p) => p.currency_code === "eur")?.amount
      const onRequest = want.color === ON_REQUEST_COLOR.value
      return (
        weight !== variant.weight ||
        (price !== null && price !== eur) ||
        Boolean(variant.metadata?.color_on_request) !== onRequest
      )
    })

  const linked = (option) =>
    existing.options.find((o) => o.id === option.id)?.values.map((v) => v.value) ?? []
  const missingValues = (option, values) => values.filter((v) => !linked(option).includes(v))
  const unusedValues = (option, values) => linked(option).filter((v) => !values.includes(v))
  const optionUpdates = [
    [sizeOption, sizes],
    [colorOption, colors],
  ]
    .map(([option, values]) => ({
      option,
      add: missingValues(option, values),
      remove: unusedValues(option, values),
    }))
    .filter((u) => u.add.length || u.remove.length)
  const categoryChanged = categoryId && !existing.categories.some((c) => c.id === categoryId)

  if (!toDelete.length && !toCreate.length && !toUpdate.length && !optionUpdates.length && !categoryChanged) {
    continue
  }
  log(
    `${product.handle}: +${toCreate.length} -${toDelete.length} ~${toUpdate.length} variants` +
      optionUpdates.map((u) => ` · ${u.option === sizeOption ? "Ausführung" : "Farbe"} +[${u.add}] -[${u.remove}]`).join("")
  )

  const linkValues = optionUpdates.filter((u) => u.add.length)
  if (linkValues.length) {
    await write(`/admin/products/${existing.id}/options/batch`, {
      body: {
        update: linkValues.map((u) => ({
          product_option_id: u.option.id,
          add: u.add.map((v) => u.option.valueIds.get(v)),
        })),
      },
    })
  }
  if (toDelete.length || toCreate.length || toUpdate.length) {
    await write(`/admin/products/${existing.id}/variants/batch`, {
      body: {
        delete: toDelete,
        create: toCreate.map(variantPayload),
        update: toUpdate.map(({ variant, want }) => {
          const payload = variantPayload(want)
          return {
            id: variant.id,
            ...(payload.weight ? { weight: payload.weight } : {}),
            metadata: { ...variant.metadata, ...payload.metadata },
            ...(want.row.preis_eur ? { prices: payload.prices } : {}),
          }
        }),
      },
    })
  }
  const unlinkValues = optionUpdates.filter((u) => u.remove.length)
  if (unlinkValues.length) {
    await write(`/admin/products/${existing.id}/options/batch`, {
      body: {
        update: unlinkValues.map((u) => ({
          product_option_id: u.option.id,
          remove: u.remove.map((v) => u.option.values.find((x) => x.value === v)?.id).filter(Boolean),
        })),
      },
    })
  }
  if (categoryChanged) {
    await write(`/admin/products/${existing.id}`, { body: { categories: [{ id: categoryId }] } })
  }
  updated++
}

// --- Translations ----------------------------------------------------------
// Option titles and values, then everything collected above, skipping
// records that already have an English translation.
translate("product_option", sizeOption.id, { title: SIZE_OPTION.en })
translate("product_option", colorOption.id, { title: COLOR_OPTION.en })
const refreshedSize = DRY_RUN ? sizeOption : await ensureValuesOf(SIZE_OPTION.title)
const refreshedColor = DRY_RUN ? colorOption : await ensureValuesOf(COLOR_OPTION.title)
for (const v of refreshedSize.values) {
  if (sizeValues.has(v.value)) translate("product_option_value", v.id, { value: sizeValues.get(v.value) })
}
for (const v of refreshedColor.values) {
  if (colorValues.has(v.value)) translate("product_option_value", v.id, { value: colorValues.get(v.value) })
}

async function ensureValuesOf(title) {
  const option = await fetchOption(title)
  return { id: option.id, values: option.values }
}

const existingTranslations = new Set()
for (let offset = 0; ; offset += 1000) {
  const { translations: page, count } = await api(
    `/admin/translations?locale_code=${LOCALE}&fields=reference_id&limit=1000&offset=${offset}`
  )
  page.forEach((t) => existingTranslations.add(t.reference_id))
  if (offset + 1000 >= count) break
}
const newTranslations = translations.filter(
  (t, i, all) =>
    t.reference_id &&
    !existingTranslations.has(t.reference_id) &&
    all.findIndex((x) => x.reference_id === t.reference_id) === i
)
if (newTranslations.length) {
  log(`translations: ${newTranslations.length} new`)
  await write("/admin/translations/batch", { body: { create: newTranslations } })
}

// --- Prune option values no product uses any more ---------------------------
for (const [option, used] of [
  [refreshedSize, usedSizeValues],
  [refreshedColor, usedColorValues],
]) {
  const keep = option.values.filter((v) => used.has(v.value)).map((v) => v.value)
  const drop = option.values.filter((v) => !used.has(v.value)).map((v) => v.value)
  if (drop.length) {
    log(`option values no longer used: ${drop.join(", ")}`)
    try {
      await write(`/admin/product-options/${option.id}`, { body: { values: keep } })
    } catch (e) {
      // Deleted products keep their links; unused values are invisible in
      // the store, so this is only cosmetic.
      log(`  kept them: ${e.message}`)
    }
  }
}

log(`done: ${created} created, ${updated} updated${DRY_RUN ? " (dry run)" : ""}`)
