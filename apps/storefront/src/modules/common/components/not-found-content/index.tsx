import { getTranslations } from "next-intl/server"
import Link from "next/link"

const NotFoundContent = async ({ cart = false }: { cart?: boolean }) => {
  const t = await getTranslations("notFound")

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] text-center px-4">
      <h1 className="text-2xl-semi text-ui-fg-base">{t("title")}</h1>
      <p className="text-small-regular text-ui-fg-subtle max-w-md">
        {cart ? t("cartText") : t("text")}
      </p>
      <Link
        className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
        href="/"
      >
        {t("home")}
      </Link>
    </div>
  )
}

export default NotFoundContent
