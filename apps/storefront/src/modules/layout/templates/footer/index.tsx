import { listCategories } from "@lib/data/categories"
import { SHOP_NAME, SMALL_BUSINESS } from "@lib/constants"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/layout/components/logo"
import { getTranslations } from "next-intl/server"
import { ArrowUturnLeft } from "@medusajs/icons"

export default async function Footer() {
  const t = await getTranslations("footer")
  const productCategories = await listCategories()
  const legalLinks = [
    { href: "/versand-zahlung", label: t("shippingPayment") },
    { href: "/agb", label: t("terms") },
    { href: "/widerrufsbelehrung", label: t("cancellationPolicy") },
    { href: "/datenschutz", label: t("privacy") },
    { href: "/impressum", label: t("imprint") },
  ]
  const topCategories = (productCategories ?? []).filter(
    (c) => !c.parent_category
  )

  return (
    <footer className="border-t border-ui-border-base w-full bg-ui-bg-subtle">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-10 xsmall:flex-row items-start justify-between py-16">
          <div className="flex flex-col gap-y-3 max-w-xs">
            <Logo />
            <Text className="txt-small text-ui-fg-subtle">{t("tagline")}</Text>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 small:grid-cols-3">
            {topCategories.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus text-ui-fg-base">
                  {t("categories")}
                </span>
                <ul
                  className="grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small"
                  data-testid="footer-categories"
                >
                  {topCategories.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-ui-fg-base">
                {t("shop")}
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/store">
                    {t("allProducts")}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/cart">
                    {t("cart")}
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus text-ui-fg-base">
                {t("legal")}
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <LocalizedClientLink className="hover:text-ui-fg-base" href={link.href}>
                      {link.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Online withdrawal function (§ 356a BGB): visible on every page. */}
        <div className="flex flex-col xsmall:flex-row xsmall:items-center justify-between gap-4 border-t border-ui-border-base py-6">
          <span className="txt-small text-ui-fg-subtle">{t("withdrawalHint")}</span>
          <LocalizedClientLink
            href="/widerruf"
            className="inline-flex items-center gap-x-2 self-start rounded-lg border border-ui-border-strong bg-white px-4 h-10 txt-compact-small-plus text-ui-fg-base hover:border-brand hover:text-brand"
            data-testid="footer-withdrawal-link"
          >
            <ArrowUturnLeft />
            {t("withdrawalButton")}
          </LocalizedClientLink>
        </div>
        <div className="flex w-full pb-10 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} {SHOP_NAME}. {t("rights")}
          </Text>
          <Text className="txt-compact-small">{t(SMALL_BUSINESS ? "vatNoticeSmallBusiness" : "vatNotice")}</Text>
        </div>
      </div>
    </footer>
  )
}
