"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import { Tools } from "@medusajs/icons"
import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const t = useTranslations("product")

  const tabs = [
    {
      label: t("tabs.details"),
      component: <ProductInfoTab product={product} />,
    },
    {
      label: t("tabs.shipping"),
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const ProductInfoTab = ({ product }: ProductTabsProps) => {
  const t = useTranslations("product.details")

  return (
    <div className="text-small-regular py-6">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <span className="font-semibold">{t("material")}</span>
          <p>{product.material || t("materialDefault")}</p>
        </div>
        <div>
          <span className="font-semibold">{t("weight")}</span>
          <p>{product.weight ? `ca. ${product.weight} g` : "-"}</p>
        </div>
        <div>
          <span className="font-semibold">{t("origin")}</span>
          <p>{t("originDefault")}</p>
        </div>
        {product.length && product.width && product.height ? (
          <div>
            <span className="font-semibold">{t("dimensions")}</span>
            <p>{`${product.length} x ${product.width} x ${product.height} mm`}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const ShippingInfoTab = () => {
  const t = useTranslations("product.shipping")

  const items = [
    { icon: <Tools />, title: t("madeToOrderTitle"), text: t("madeToOrderText") },
    { icon: <FastDelivery />, title: t("deliveryTitle"), text: t("deliveryText") },
    {
      icon: <Back />,
      title: t("returnsTitle"),
      text: t.rich("returnsText", {
        policy: (chunks) => (
          <LocalizedClientLink href="/widerrufsbelehrung" className="text-ui-fg-interactive hover:underline">
            {chunks}
          </LocalizedClientLink>
        ),
      }),
    },
  ]

  return (
    <div className="text-small-regular py-6">
      <div className="grid grid-cols-1 gap-y-6">
        {items.map((item) => (
          <div key={String(item.title)} className="flex items-start gap-x-3">
            <span className="text-ui-fg-subtle">{item.icon}</span>
            <div>
              <span className="font-semibold">{item.title}</span>
              <p className="max-w-sm text-ui-fg-subtle">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductTabs
