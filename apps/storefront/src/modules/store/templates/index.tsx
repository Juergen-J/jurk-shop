import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { getCategoryTree } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import CategoryNav from "@modules/store/components/category-nav"
import PaginatedProducts from "@modules/store/templates/paginated-products"

/** The catalog: all products, or the results of a search (`q`). */
const StoreTemplate = async ({
  countryCode,
  page,
  q,
}: {
  countryCode: string
  page?: string
  q?: string
}) => {
  const t = await getTranslations("store")
  const tree = await getCategoryTree()
  const pageNumber = page ? parseInt(page) : 1

  return (
    <div
      className="py-8 small:py-10 content-container flex flex-col small:flex-row gap-y-6 small:gap-x-10"
      data-testid="category-container"
    >
      <CategoryNav tree={tree} />
      <div className="flex-1 min-w-0">
        <div className="mb-8 flex flex-col gap-y-1">
          <h1 className="text-2xl-semi" data-testid="store-page-title">
            {q ? t("searchTitle", { q }) : t("title")}
          </h1>
          {!q && (
            <p className="txt-medium text-ui-fg-subtle">{t("description")}</p>
          )}
        </div>
        <Suspense key={`${q}-${pageNumber}`} fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy="popularity"
            page={pageNumber}
            countryCode={countryCode}
            q={q}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
