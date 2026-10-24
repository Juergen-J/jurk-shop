"use client"

import type { Hit } from "instantsearch.js"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import HitPrice, { HitPricing } from "./price"

export type ProductHit = Hit<
  {
    title: string | null
    handle: string | null
    thumbnail: string | null
  } & HitPricing
>

/** One product in the catalog grid. */
const HitCard = ({
  hit,
  currencyCode,
}: {
  hit: ProductHit
  currencyCode: string
}) => (
  <LocalizedClientLink href={`/products/${hit.handle}`} className="group">
    <div data-testid="product-wrapper">
      <Thumbnail thumbnail={hit.thumbnail} size="full" />
      {/* Price under the title: two columns on a phone leave ~160px, too
          little for a long caliber name next to a price range */}
      <div className="flex flex-col gap-y-1 txt-compact-medium mt-4 min-w-0">
        <Text
          className="text-ui-fg-subtle [overflow-wrap:anywhere]"
          data-testid="product-title"
        >
          {hit.title ?? hit.handle}
        </Text>
        <HitPrice hit={hit} currencyCode={currencyCode} />
      </div>
    </div>
  </LocalizedClientLink>
)

export default HitCard
