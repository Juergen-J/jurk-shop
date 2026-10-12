import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SHOP_NAME } from "@lib/constants"

const Logo = () => {
  return (
    <LocalizedClientLink
      href="/"
      className="flex items-center gap-x-2 text-ui-fg-base"
      data-testid="nav-store-link"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="6" className="fill-brand" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          className="fill-white font-bold"
          fontSize="10"
        >
          JJ
        </text>
      </svg>
      <span className="txt-compact-large-plus tracking-tight">{SHOP_NAME}</span>
    </LocalizedClientLink>
  )
}

export default Logo
