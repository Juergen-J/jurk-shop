import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..")
export const CATALOG_CSV = join(ROOT, "catalog/catalog.csv")

/** A setting from the environment or the root .env (values are never printed). */
export const envValue = async (name) => {
  if (process.env[name]) return process.env[name]
  const env = join(ROOT, ".env")
  if (existsSync(env)) {
    const line = (await readFile(env, "utf8"))
      .split("\n")
      .find((l) => l.startsWith(`${name}=`))
    if (line) return line.slice(name.length + 1).trim().replace(/^["']|["']$/g, "")
  }
  return undefined
}

export const required = async (name) => {
  const value = await envValue(name)
  if (!value) throw new Error(`${name} is not set (environment or root .env)`)
  return value
}

/** Splits one `;`-separated CSV line, honouring double quotes. */
const splitLine = (line) => {
  const cells = []
  let cell = ""
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === ";") {
      cells.push(cell)
      cell = ""
    } else cell += c
  }
  cells.push(cell)
  return cells
}

/**
 * catalog/catalog.csv: one row per product option ("Ausführung"). Rows with
 * the same produkt_handle form one product, in file order.
 */
export const readCatalog = async () => {
  const text = (await readFile(CATALOG_CSV, "utf8")).replace(/^﻿/, "")
  const [header, ...lines] = text.split(/\r?\n/).filter((l) => l.trim())
  const keys = splitLine(header)
  return lines.map((line) =>
    Object.fromEntries(splitLine(line).map((v, i) => [keys[i], v.trim()]))
  )
}

/** Rows grouped by product, in file order: [{ handle, rows }] */
export const groupProducts = (rows) => {
  const products = new Map()
  for (const row of rows) {
    const list = products.get(row.produkt_handle) ?? []
    list.push(row)
    products.set(row.produkt_handle, list)
  }
  return Array.from(products, ([handle, rows]) => ({ handle, rows }))
}

/** Medusa Admin API client (MEDUSA_URL, default localhost; MEDUSA_ADMIN_KEY). */
export const adminClient = async () => {
  const baseUrl = (await envValue("MEDUSA_URL")) ?? "http://localhost:9000"
  const auth = `Basic ${Buffer.from(`${await required("MEDUSA_ADMIN_KEY")}:`).toString("base64")}`
  const request = async (path, init = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        authorization: auth,
        ...(init.body && !(init.body instanceof FormData)
          ? { "content-type": "application/json" }
          : {}),
        ...init.headers,
      },
      body:
        init.body && !(init.body instanceof FormData) && typeof init.body !== "string"
          ? JSON.stringify(init.body)
          : init.body,
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(`${init.method ?? "GET"} ${path}: ${res.status} ${body.message ?? ""}`)
    }
    return body
  }
  request.baseUrl = baseUrl
  return request
}
