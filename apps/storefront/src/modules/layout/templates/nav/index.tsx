import { Suspense } from "react"

import { getTranslations } from "next-intl/server"
import { getCategoryTree } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CategoryMenu from "@modules/layout/components/category-menu"
import LanguageSwitch from "@modules/layout/components/language-switch"
import Logo from "@modules/layout/components/logo"
import SearchInput from "@modules/layout/components/search-input"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const t = await getTranslations("nav")
  const categoryTree = await getCategoryTree()

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative mx-auto border-b duration-200 bg-white/80 backdrop-blur border-ui-border-base pt-[env(safe-area-inset-top)]">
        <nav className="content-container text-ui-fg-subtle flex items-center justify-between gap-x-6 w-full h-16 txt-compact-medium">
          <Logo />

          <Suspense>
            <SearchInput className="hidden small:flex flex-1 max-w-md" />
          </Suspense>

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
              <SideMenu categories={categoryTree} />
            </div>
          </div>
        </nav>
        <div className="small:hidden content-container pb-3">
          <Suspense>
            <SearchInput />
          </Suspense>
        </div>
        <div className="border-t border-ui-border-base hidden small:block">
          <CategoryMenu tree={categoryTree} />
        </div>
      </header>
    </div>
  )
}
