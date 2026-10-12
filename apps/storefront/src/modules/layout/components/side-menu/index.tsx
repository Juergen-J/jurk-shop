"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import { BarsThree, XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SHOP_NAME } from "@lib/constants"
import { useTranslations } from "next-intl"
import { Fragment } from "react"
import LanguageSwitch from "../language-switch"

const SideMenu = () => {
  const t = useTranslations("nav")

  const items = [
    { label: t("home"), href: "/" },
    { label: t("shop"), href: "/store" },
    { label: t("cartTitle"), href: "/cart" },
  ]

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
            <PopoverPanel className="fixed inset-0 z-[51] bg-white flex flex-col p-6">
              <div className="flex justify-end">
                <button
                  data-testid="close-menu-button"
                  aria-label={t("close")}
                  onClick={() => close()}
                >
                  <XMark />
                </button>
              </div>
              <ul className="flex flex-col gap-6 mt-8">
                {items.map((item) => (
                  <li key={item.href}>
                    <LocalizedClientLink
                      href={item.href}
                      className="text-3xl leading-10 text-ui-fg-base hover:text-brand"
                      onClick={() => close()}
                    >
                      {item.label}
                    </LocalizedClientLink>
                  </li>
                ))}
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
