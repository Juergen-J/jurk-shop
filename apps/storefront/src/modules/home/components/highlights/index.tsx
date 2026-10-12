import { ClockSolid, SwatchSolid, TruckFast } from "@medusajs/icons"
import { getTranslations } from "next-intl/server"

const Highlights = async () => {
  const t = await getTranslations("home.highlights")

  const items = [
    { icon: <SwatchSolid />, title: t("customTitle"), text: t("customText") },
    { icon: <ClockSolid />, title: t("printTitle"), text: t("printText") },
    { icon: <TruckFast />, title: t("shippingTitle"), text: t("shippingText") },
  ]

  return (
    <section className="content-container py-12 small:py-16">
      <ul className="grid grid-cols-1 small:grid-cols-3 gap-6">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex gap-x-4 rounded-2xl border border-ui-border-base p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              {item.icon}
            </span>
            <div className="flex flex-col gap-y-1">
              <span className="txt-compact-medium-plus text-ui-fg-base">
                {item.title}
              </span>
              <span className="txt-small text-ui-fg-subtle">{item.text}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Highlights
