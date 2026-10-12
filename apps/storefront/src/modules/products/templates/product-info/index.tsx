import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const category = product.categories?.[0]

  return (
    <div id="product-info" className="flex flex-col gap-y-3">
      {category && (
        <LocalizedClientLink
          href={`/categories/${category.handle}`}
          className="txt-compact-small-plus uppercase tracking-wide text-brand hover:text-brand-dark"
        >
          {category.name}
        </LocalizedClientLink>
      )}
      <Heading
        level="h1"
        className="text-3xl leading-10 text-ui-fg-base"
        data-testid="product-title"
      >
        {product.title}
      </Heading>
      {product.subtitle && (
        <Text className="txt-medium text-ui-fg-subtle">{product.subtitle}</Text>
      )}
      <Text
        className="txt-medium text-ui-fg-subtle whitespace-pre-line"
        data-testid="product-description"
      >
        {product.description}
      </Text>
    </div>
  )
}

export default ProductInfo
