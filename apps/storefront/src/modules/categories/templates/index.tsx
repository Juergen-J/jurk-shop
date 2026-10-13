import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getCategoryTree } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategoryNav from "@modules/store/components/category-nav"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const tree = await getCategoryTree()
  const parent = tree.find((c) => c.id === category.parent_category_id)

  return (
    <div
      className="py-8 small:py-10 content-container flex flex-col small:flex-row gap-y-6 small:gap-x-10"
      data-testid="category-container"
    >
      <CategoryNav tree={tree} activeHandle={category.handle} />
      <div className="flex-1 min-w-0">
        <div className="mb-8 flex flex-col gap-y-1">
          {parent && (
            <LocalizedClientLink
              href={`/categories/${parent.handle}`}
              className="txt-compact-small text-ui-fg-subtle hover:text-ui-fg-base"
            >
              {parent.name}
            </LocalizedClientLink>
          )}
          <h1 className="text-2xl-semi" data-testid="category-page-title">
            {category.name}
          </h1>
          {category.description && (
            <p className="txt-medium text-ui-fg-subtle">
              {category.description}
            </p>
          )}
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryIds={[
              category.id,
              ...(category.category_children ?? []).map((c) => c.id),
            ]}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}
