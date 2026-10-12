import { Suspense } from "react"

import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import LanguageSwitch from "@modules/layout/components/language-switch"
import Logo from "@modules/layout/components/logo"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const t = await getTranslations("nav")

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white/80 backdrop-blur border-ui-border-base">
        <nav className="content-container text-ui-fg-subtle flex items-center justify-between w-full h-full txt-compact-medium">
          <div className="flex items-center gap-x-8 h-full">
            <Logo />
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/store"
                data-testid="nav-shop-link"
              >
                {t("shop")}
              </LocalizedClientLink>
            </div>
          </div>

          <div className="flex items-center gap-x-4 small:gap-x-6 h-full">
            <LanguageSwitch className="hidden small:flex" />
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {t("cart", { count: 0 })}
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
            <div className="small:hidden h-full">
              <SideMenu />
            </div>
          </div>
        </nav>
      </header>
    </div>
  )
}
