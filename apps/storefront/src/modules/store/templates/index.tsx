import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"

const StoreTemplate = async ({
  countryCode,
  page,
}: {
  countryCode: string
  page?: string
}) => {
  const t = await getTranslations("store")
  const pageNumber = page ? parseInt(page) : 1

  return (
    <div className="py-10 content-container" data-testid="category-container">
      <div className="mb-10 flex flex-col gap-y-2">
        <h1 className="text-3xl leading-10" data-testid="store-page-title">
          {t("title")}
        </h1>
        <p className="txt-medium text-ui-fg-subtle">{t("description")}</p>
      </div>
      <Suspense fallback={<SkeletonProductGrid />}>
        <PaginatedProducts
          sortBy="created_at"
          page={pageNumber}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}

export default StoreTemplate
