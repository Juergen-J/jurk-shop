import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"
import ProductionTime from "@modules/common/components/production-time"
import { estimateProduction } from "@lib/util/production-time"
import { ShopSettings } from "@lib/data/shop-settings"
import ShopPerks from "@modules/products/components/shop-perks"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
  shopSettings: ShopSettings
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
  shopSettings,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container grid grid-cols-1 small:grid-cols-[minmax(0,1fr)_420px] gap-x-16 gap-y-8 py-8 small:py-12"
        data-testid="product-container"
      >
        <div className="w-full">
          <ImageGallery images={images} />
        </div>
        <div className="flex flex-col gap-y-8 small:sticky small:top-24 small:self-start">
          <ProductInfo product={product} />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
          <ProductionTime
            estimate={estimateProduction(shopSettings.production_tiers, 1)}
            tiers={shopSettings.production_tiers}
          />
          <ShopPerks settings={shopSettings} />
          <ProductTabs product={product} />
        </div>
      </div>
      <div
        className="content-container my-16 small:my-24"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
