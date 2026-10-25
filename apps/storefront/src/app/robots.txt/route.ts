import { getBaseURL } from "@lib/util/env"

// Pages that are per customer or not meant for search results. Paths start
// with the country code; "*" covers every region.
const PRIVATE_PATHS = [
  "/*/cart",
  "/*/checkout",
  "/*/account",
  "/*/order",
  "/*/verify-account",
  "/*/dev",
]

/**
 * A route instead of app/robots.ts: Next's robots helper can't write the
 * Content-Signal line (contentsignals.org) that says how crawled pages may be
 * used. The shop allows search, AI answers and AI training.
 */
export function GET() {
  const base = getBaseURL().replace(/\/$/, "")

  const body = [
    "User-Agent: *",
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "Allow: /",
    ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n")

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
