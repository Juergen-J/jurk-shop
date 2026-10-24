import { ChevronDownMini } from "@medusajs/icons"
import { getTranslations } from "next-intl/server"

import { CategoryNode } from "@lib/util/category-tree"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Desktop category bar below the header. Categories with subcategories open
 * a dropdown on hover or keyboard focus.
 */
const CategoryMenu = async ({ tree }: { tree: CategoryNode[] }) => {
  const t = await getTranslations("nav")

  return (
    <nav
      aria-label={t("categories")}
      className="content-container hidden small:flex items-center gap-x-8 h-11 txt-compact-small-plus text-ui-fg-subtle"
      data-testid="category-menu"
    >
      <LocalizedClientLink href="/" className="hover:text-ui-fg-base">
        {t("allProducts")}
      </LocalizedClientLink>
      {tree.map((category) =>
        category.children.length ? (
          <div
            key={category.id}
            className="group/cat relative h-full flex items-center"
          >
            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              className="flex items-center gap-x-1 hover:text-ui-fg-base"
              aria-haspopup="true"
            >
              {category.name}
              <ChevronDownMini className="transition-transform group-hover/cat:rotate-180 group-has-[:focus-visible]/cat:rotate-180" />
            </LocalizedClientLink>
            <div className="invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100 group-has-[:focus-visible]/cat:visible group-has-[:focus-visible]/cat:opacity-100 origin-top-left scale-[0.97] group-hover/cat:scale-100 group-has-[:focus-visible]/cat:scale-100 transition-[opacity,transform,visibility] duration-150 ease-out-strong absolute left-0 top-full z-50 pt-1">
              <ul className="min-w-56 rounded-xl border border-ui-border-base bg-white p-2 shadow-elevation-flyout">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <LocalizedClientLink
                      href={`/categories/${child.handle}`}
                      className="block rounded-lg px-3 py-2 txt-compact-small text-ui-fg-base hover:bg-ui-bg-base-hover"
                    >
                      {child.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <LocalizedClientLink
            key={category.id}
            href={`/categories/${category.handle}`}
            className="hover:text-ui-fg-base"
          >
            {category.name}
          </LocalizedClientLink>
        )
      )}
    </nav>
  )
}

export default CategoryMenu
