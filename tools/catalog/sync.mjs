#!/usr/bin/env node
/**
 * Brings a shop up to date with catalog/catalog.csv and catalog/images/ai:
 * the catalog import, then the photo upload (only products whose photos
 * changed). Safe to run as often as you like.
 *
 *   pnpm catalog:sync                 # local backend (MEDUSA_URL / MEDUSA_ADMIN_KEY)
 *   pnpm catalog:sync --prod          # production (PROD_MEDUSA_URL / PROD_MEDUSA_ADMIN_KEY)
 *   pnpm catalog:sync --prod --dry-run
 *
 * Options:
 *   --prod           use the PROD_* settings from the root .env, asks first
 *   --yes            do not ask before changing production
 *   --dry-run        only show what the import would change, no upload
 *   --update-texts   also overwrite product texts (see import.mjs)
 *   --force          upload all photos again
 */
import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"

import { required } from "./lib.mjs"

const DIR = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const has = (flag) => args.includes(flag)

const env = { ...process.env }
if (has("--prod")) {
  try {
    env.MEDUSA_URL = await required("PROD_MEDUSA_URL")
    env.MEDUSA_ADMIN_KEY = await required("PROD_MEDUSA_ADMIN_KEY")
  } catch (e) {
    console.error(`${e.message}.\nAdd PROD_MEDUSA_URL=https://api.jurk.pro and PROD_MEDUSA_ADMIN_KEY=sk_... (Admin → Settings → Secret API Keys) to the root .env.`)
    process.exit(1)
  }
  if (!has("--yes") && !has("--dry-run")) {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    const answer = await rl.question(`Update the catalog at ${env.MEDUSA_URL}? (yes/no) `)
    rl.close()
    if (answer.trim().toLowerCase() !== "yes") {
      console.log("Cancelled.")
      process.exit(1)
    }
  }
}

const run = (script, scriptArgs) => {
  console.log(`\n▸ ${script} ${scriptArgs.join(" ")}`)
  const result = spawnSync(process.execPath, [join(DIR, script), ...scriptArgs], {
    env,
    stdio: "inherit",
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(
  "import.mjs",
  ["--dry-run", "--update-texts"].filter(has)
)
if (!has("--dry-run")) {
  run("images.mjs", ["upload", ...(has("--force") ? ["--force"] : [])])
}
console.log("\nCatalog is up to date.")
