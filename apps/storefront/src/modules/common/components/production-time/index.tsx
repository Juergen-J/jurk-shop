import { ClockSolid } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { ProductionEstimate, ProductionTier } from "@lib/util/production-time"
import { useTranslations } from "next-intl"

type ProductionTimeProps = {
  estimate: ProductionEstimate | null
  /** Shows the full tier table below the estimate (product page). */
  tiers?: ProductionTier[]
  className?: string
}

const ProductionTime = ({ estimate, tiers, className }: ProductionTimeProps) => {
  const t = useTranslations("production")

  if (!estimate) {
    return null
  }

  const days = (min: number, max: number) =>
    min === max ? t("days", { count: min }) : t("daysRange", { min, max })

  const tierLabel = (tier: ProductionTier, index: number) => {
    const from = index === 0 ? 1 : (tiers![index - 1].max ?? 0) + 1

    if (tier.max === null) {
      return t("tierFrom", { from })
    }

    return from === tier.max
      ? t("tierExact", { count: from })
      : t("tierRange", { from, to: tier.max })
  }

  return (
    <div
      className={clx(
        "flex gap-x-3 rounded-xl bg-brand/5 border border-brand/20 p-4",
        className
      )}
      data-testid="production-time"
    >
      <span className="text-brand mt-0.5">
        <ClockSolid />
      </span>
      <div className="flex flex-col gap-y-1 txt-small text-ui-fg-subtle">
        <span className="txt-compact-small-plus text-ui-fg-base">
          {t("title", { count: estimate.quantity })}{" "}
          {days(estimate.minDays, estimate.maxDays)}
        </span>
        <span>{t("note")}</span>
        {tiers && tiers.length > 1 && (
          <ul className="mt-2 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-0.5">
            {tiers.map((tier, index) => (
              <li key={index} className="contents">
                <span>{tierLabel(tier, index)}</span>
                <span className="text-ui-fg-base">
                  {days(tier.min_days, tier.max_days)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ProductionTime
