import { getTranslations } from "next-intl/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = async () => {
  const t = await getTranslations("home")

  return (
    <section className="relative overflow-hidden border-b border-ui-border-base bg-gradient-to-b from-brand/5 to-white">
      <div className="content-container py-20 small:py-32">
        <div className="flex flex-col items-start gap-6 max-w-3xl">
          <span className="txt-compact-small-plus uppercase tracking-wider text-brand">
            {t("eyebrow")}
          </span>
          <h1 className="text-4xl small:text-5xl leading-tight font-semibold text-ui-fg-base">
            {t("title")}
          </h1>
          <p className="txt-large text-ui-fg-subtle max-w-xl">
            {t("subtitle")}
          </p>
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-6 h-12 text-white txt-compact-medium-plus hover:bg-brand-dark transition-colors"
            data-testid="hero-shop-link"
          >
            {t("cta")}
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default Hero
