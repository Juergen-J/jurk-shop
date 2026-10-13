import { getTranslations } from "next-intl/server"

import { activeHandles, CategoryNode } from "@lib/util/category-tree"
import { clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Category tree next to the product grid (desktop) and as scrollable chips
 * above it (mobile).
 */
const CategoryNav = async ({
  tree,
  activeHandle,
}: {
  tree: CategoryNode[]
  activeHandle?: string
}) => {
  const t = await getTranslations("nav")
  const active = activeHandles(tree, activeHandle)

  const link = (
    href: string,
    label: string,
    isActive: boolean,
    sub = false,
    isAncestor = false
  ) => (
    <LocalizedClientLink
      href={href}
      className={clx(
        "block rounded-lg px-3 py-1.5 transition-colors hover:bg-ui-bg-base-hover hover:text-ui-fg-base",
        sub ? "txt-compact-small" : "txt-compact-small-plus",
        isActive
          ? "bg-ui-bg-base-hover text-ui-fg-base"
          : isAncestor
          ? "text-ui-fg-base"
          : "text-ui-fg-subtle"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </LocalizedClientLink>
  )

  const chip = (href: string, label: string, isActive: boolean) => (
    <LocalizedClientLink
      key={href}
      href={href}
      className={clx(
        "shrink-0 rounded-full border px-3 py-1.5 txt-compact-small transition-colors",
        isActive
          ? "border-brand bg-brand text-white"
          : "border-ui-border-base text-ui-fg-subtle hover:text-ui-fg-base"
      )}
    >
      {label}
    </LocalizedClientLink>
  )

  const flat = tree.flatMap((c) => [c, ...c.children])

  return (
    <>
      <aside
        className="hidden small:block w-56 shrink-0"
        data-testid="category-sidebar"
      >
        <nav
          aria-label={t("categories")}
          className="sticky top-36 flex flex-col gap-y-1"
        >
          {link("/", t("allProducts"), !activeHandle)}
          {tree.map((category) => (
            <div key={category.id} className="flex flex-col gap-y-1">
              {link(
                `/categories/${category.handle}`,
                category.name,
                category.handle === activeHandle,
                false,
                active.has(category.handle)
              )}
              {category.children.length > 0 && (
                <div className="ml-3 flex flex-col gap-y-1 border-l border-ui-border-base pl-2">
                  {category.children.map((child) => (
                    <div key={child.id}>
                      {link(
                        `/categories/${child.handle}`,
                        child.name,
                        child.handle === activeHandle,
                        true
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <nav
        aria-label={t("categories")}
        className="small:hidden -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {chip("/", t("allProducts"), !activeHandle)}
        {flat.map((category) =>
          chip(
            `/categories/${category.handle}`,
            category.name,
            category.handle === activeHandle
          )
        )}
      </nav>
    </>
  )
}

export default CategoryNav
