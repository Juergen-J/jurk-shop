import { notFound } from "next/navigation"

import ItemsTemplate from "@modules/cart/templates/items"
import HitCard from "@modules/store/components/store-hits/hit-card"
import { DataSet, cartFor, hitsFor } from "./fixtures"

const SETS: { id: DataSet; label: string }[] = [
  { id: "demo", label: "Demo data" },
  { id: "worst", label: "Worst case" },
  { id: "one", label: "One" },
  { id: "empty", label: "Empty" },
]

/**
 * Dev-only stress test (break-ui): the catalog card and the cart with demo and
 * worst-case data. Switch with ?data=demo|worst|one|empty.
 */
export default async function BreakUiPage(props: {
  searchParams: Promise<{ data?: string }>
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound()
  }

  const { data: raw } = await props.searchParams
  const data = (SETS.find((s) => s.id === raw)?.id ?? "demo") as DataSet
  const hits = hitsFor(data)

  return (
    <div className="content-container py-12 flex flex-col gap-16 pb-32">
      <section>
        <h2 className="txt-compact-large-plus mb-6">Katalog</h2>
        {hits.length ? (
          <ul className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
            {hits.map((hit) => (
              <li key={hit.objectID}>
                <HitCard hit={hit} currencyCode="eur" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ui-fg-subtle">(no hits)</p>
        )}
      </section>

      <section>
        <ItemsTemplate cart={cartFor(data)} />
      </section>

      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 whitespace-nowrap rounded-full bg-gray-200 p-1 font-sans text-xs shadow"
        aria-label="Fixture data"
      >
        {SETS.map((s) => (
          <a
            key={s.id}
            href={`?data=${s.id}`}
            className={
              s.id === data
                ? "rounded-full bg-white px-3 py-1.5 text-black"
                : "rounded-full px-3 py-1.5 text-gray-600"
            }
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
