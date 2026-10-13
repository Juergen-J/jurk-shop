"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { BarsThree, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SHOP_NAME } from "@lib/constants"
import { CategoryNode } from "@lib/util/category-tree"
import { useTranslations } from "next-intl"
import { Fragment } from "react"
import LanguageSwitch from "../language-switch"

const SideMenu = ({ categories }: { categories: CategoryNode[] }) => {
  const t = useTranslations("nav")

  return (
    <Popover className="h-full flex">
      {({ open, close }) => (
        <>
          <PopoverButton
            data-testid="nav-menu-button"
            aria-label={t("menu")}
            className="h-full flex items-center focus:outline-none hover:text-ui-fg-base"
          >
            <BarsThree />
          </PopoverButton>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* Portal: the header's backdrop-blur would otherwise confine the fixed panel. */}
            <PopoverPanel
              portal
              className="fixed inset-0 z-[51] bg-white flex flex-col p-6"
            >
              <div className="flex justify-end">
                <button
                  data-testid="close-menu-button"
                  aria-label={t("close")}
                  onClick={() => close()}
                >
                  <XMark />
                </button>
              </div>
              <ul className="flex flex-col gap-5 mt-6 overflow-y-auto pb-6">
                <li>
                  <LocalizedClientLink
                    href="/"
                    className="text-2xl text-ui-fg-base hover:text-brand"
                    onClick={() => close()}
                  >
                    {t("allProducts")}
                  </LocalizedClientLink>
                </li>
                {categories.map((category) => (
                  <li key={category.id} className="flex flex-col gap-3">
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="text-2xl text-ui-fg-base hover:text-brand"
                      onClick={() => close()}
                    >
                      {category.name}
                    </LocalizedClientLink>
                    {category.children.length > 0 && (
                      <ul className="flex flex-col gap-3 border-l border-ui-border-base pl-4">
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <LocalizedClientLink
                              href={`/categories/${child.handle}`}
                              className="text-large-regular text-ui-fg-subtle hover:text-brand"
                              onClick={() => close()}
                            >
                              {child.name}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
                <li>
                  <LocalizedClientLink
                    href="/cart"
                    className="text-2xl text-ui-fg-base hover:text-brand"
                    onClick={() => close()}
                  >
                    {t("cartTitle")}
                  </LocalizedClientLink>
                </li>
              </ul>
              <div className="mt-auto flex items-center justify-between">
                <LanguageSwitch />
                <span className="txt-compact-small text-ui-fg-muted">
                  © {new Date().getFullYear()} {SHOP_NAME}
                </span>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default SideMenu
