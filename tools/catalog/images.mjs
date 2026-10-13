#!/usr/bin/env node
/**
 * Product photos for the catalog, from the MakerWorld cover images.
 *
 *   node tools/catalog/images.mjs download   # cover photos -> catalog/images/original
 *   node tools/catalog/images.mjs generate   # OpenAI edit   -> catalog/images/ai
 *   node tools/catalog/images.mjs review     # side by side  -> catalog/images/review.html
 *   node tools/catalog/images.mjs upload     # AI images -> Medusa products (MEDUSA_URL, MEDUSA_ADMIN_KEY)
 *
 * Options:
 *   --only 1986813,2612021   only these MakerWorld model ids
 *   --force                  redo images that already exist
 *
 * The models come from catalog/catalog.csv: every MakerWorld model of a row
 * with foto=ja, once per product. `generate` needs
 * OPENAI_API_KEY (environment or the root .env); OPENAI_IMAGE_MODEL and
 * OPENAI_IMAGE_QUALITY override the defaults below. The prompt is in
 * prompt.txt next to this file; catalog/images/style.jpg, if present, is sent
 * along as a style reference for the scene.
 */
import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import { adminClient, readCatalog, required, ROOT } from "./lib.mjs"

const OUT = join(ROOT, "catalog/images")
const ORIGINAL = join(OUT, "original")
const AI = join(OUT, "ai")
const PROMPT_FILE = join(dirname(fileURLToPath(import.meta.url)), "prompt.txt")
/** Optional style reference, sent as the second image (see prompt.txt). */
const STYLE_FILE = join(OUT, "style.jpg")

const MAKERWORLD_API = "https://makerworld.com/api/v1/design-service/design"
const OPENAI_EDITS = "https://api.openai.com/v1/images/edits"
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5"
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY || "medium"

const args = process.argv.slice(2)
const command = args[0]
const force = args.includes("--force")
const onlyArg = args[args.indexOf("--only") + 1]
const only = args.includes("--only") ? new Set(onlyArg.split(",")) : null

/** Models with photos: [{ id, handle }] in catalog order, once per product. */
const loadModels = async () => {
  const seen = new Set()
  return (await readCatalog())
    .filter((r) => r.foto === "ja")
    .map((r) => ({ id: r.makerworld_id, handle: r.produkt_handle }))
    .filter((m) => {
      const key = `${m.handle}|${m.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .filter((m) => !only || only.has(m.id))
}

const ext = (url) => (url.match(/\.(png|jpe?g|webp)(\?|$)/i)?.[1] ?? "png").toLowerCase()
const originalPath = async (id) => {
  for (const e of ["png", "jpg", "jpeg", "webp"]) {
    const p = join(ORIGINAL, `${id}.${e}`)
    if (existsSync(p)) return p
  }
  return null
}
const aiPath = (id) => join(AI, `${id}.jpg`)

const download = async (models) => {
  await mkdir(ORIGINAL, { recursive: true })
  for (const { id, handle } of models) {
    if (!force && (await originalPath(id))) {
      console.log(`${id} ${handle}: already downloaded`)
      continue
    }
    // Cloudflare in front of the MakerWorld API turns away Node's fetch but
    // lets curl through.
    let design
    try {
      const { stdout } = await promisify(execFile)("curl", [
        "-sf",
        "-A",
        "Mozilla/5.0",
        `${MAKERWORLD_API}/${id}`,
      ])
      design = JSON.parse(stdout)
    } catch (e) {
      console.error(`${id} ${handle}: MakerWorld API failed (${e.code ?? e.message})`)
      continue
    }
    const { coverUrl, title } = design
    const image = await fetch(coverUrl)
    if (!image.ok) {
      console.error(`${id} ${handle}: cover ${image.status}`)
      continue
    }
    const file = join(ORIGINAL, `${id}.${ext(coverUrl)}`)
    await writeFile(file, Buffer.from(await image.arrayBuffer()))
    console.log(`${id} ${handle}: ${title} -> ${relative(ROOT, file)}`)
  }
}

const dataUrl = async (file) => {
  const type = file.endsWith(".png") ? "png" : file.endsWith(".webp") ? "webp" : "jpeg"
  return `data:image/${type};base64,${(await readFile(file)).toString("base64")}`
}

const generate = async (models) => {
  const key = await required("OPENAI_API_KEY")
  const prompt = await readFile(PROMPT_FILE, "utf8")
  await mkdir(AI, { recursive: true })
  console.log(
    `model ${IMAGE_MODEL}, quality ${IMAGE_QUALITY}, style reference: ${existsSync(STYLE_FILE) ? "yes" : "no"}`
  )

  for (const { id, handle } of models) {
    const source = await originalPath(id)
    if (!source) {
      console.error(`${id} ${handle}: no original, run download first`)
      continue
    }
    if (!force && existsSync(aiPath(id))) {
      console.log(`${id} ${handle}: already generated`)
      continue
    }
    const images = [{ image_url: await dataUrl(source) }]
    if (existsSync(STYLE_FILE)) images.push({ image_url: await dataUrl(STYLE_FILE) })

    const started = Date.now()
    const res = await fetch(OPENAI_EDITS, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        images,
        prompt,
        input_fidelity: "high",
        quality: IMAGE_QUALITY,
        size: "1024x1024",
        background: "opaque",
        output_format: "jpeg",
        output_compression: 90,
      }),
    })
    const body = await res.json()
    if (!res.ok) {
      console.error(`${id} ${handle}: OpenAI ${res.status} ${body.error?.message ?? ""}`)
      continue
    }
    await writeFile(aiPath(id), Buffer.from(body.data[0].b64_json, "base64"))
    const secs = Math.round((Date.now() - started) / 1000)
    console.log(`${id} ${handle}: done in ${secs}s, ${body.usage?.total_tokens ?? "?"} tokens`)
  }
}

const review = async (models) => {
  const rows = []
  for (const { id, handle } of models) {
    const source = await originalPath(id)
    const ai = existsSync(aiPath(id)) ? aiPath(id) : null
    const img = (p) =>
      p ? `<img src="${relative(OUT, p)}" loading="lazy">` : `<div class="missing">–</div>`
    rows.push(`
      <section>
        <h2>${handle} <a href="https://makerworld.com/en/models/${id}" target="_blank">${id}</a></h2>
        <div class="pair">${img(source)}${img(ai)}</div>
      </section>`)
  }
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Produktfotos prüfen</title>
<style>
  body { font: 14px system-ui, sans-serif; margin: 16px; background: #f4f4f5; color: #18181b; }
  h1 { font-size: 20px; }
  section { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 16px; }
  h2 { font-size: 14px; margin: 0 0 8px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .pair img, .missing { width: 100%; aspect-ratio: 1; object-fit: contain; background: #fafafa; border-radius: 8px; }
  .missing { display: grid; place-items: center; color: #a1a1aa; }
</style></head>
<body>
<h1>Produktfotos prüfen: links Original (MakerWorld), rechts KI</h1>
<p>Unpassende Bilder neu erzeugen: <code>node tools/catalog/images.mjs generate --only ID --force</code></p>
${rows.join("\n")}
</body></html>`
  const file = join(OUT, "review.html")
  await writeFile(file, html)
  console.log(`-> ${relative(ROOT, file)}`)
}

/**
 * Uploads the AI images to their products through the Medusa Admin API and
 * marks the products as having AI-edited photos. A product gets the images of
 * all its models in catalog order; the first one becomes the thumbnail.
 */
const upload = async (models) => {
  const admin = await adminClient()
  console.log(`uploading to ${admin.baseUrl}`)

  const byProduct = new Map()
  for (const m of models) {
    if (existsSync(aiPath(m.id))) {
      byProduct.set(m.handle, [...(byProduct.get(m.handle) ?? []), m.id])
    }
  }

  for (const [handle, ids] of byProduct) {
    const { products } = await admin(
      `/admin/products?handle=${handle}&fields=id,metadata`
    )
    if (!products.length) {
      console.error(`${handle}: product not found`)
      continue
    }
    const form = new FormData()
    for (const id of ids) {
      form.append("files", new Blob([await readFile(aiPath(id))], { type: "image/jpeg" }), `${handle}-${id}.jpg`)
    }
    const { files } = await admin("/admin/uploads", { method: "POST", body: form })
    const product = products[0]
    await admin(`/admin/products/${product.id}`, {
      method: "POST",
      body: {
        images: files.map((f) => ({ url: f.url })),
        thumbnail: files[0].url,
        metadata: { ...product.metadata, ai_images: true },
      },
    })
    console.log(`${handle}: ${files.length} image(s)`)
  }
}

const commands = { download, generate, review, upload }
if (!commands[command]) {
  console.error("Usage: node tools/catalog/images.mjs download|generate|review|upload [--only ids] [--force]")
  process.exit(1)
}
await commands[command](await loadModels())
