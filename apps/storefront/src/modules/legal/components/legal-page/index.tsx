import { getLegalDocument, LegalSlug } from "@lib/data/legal"
import { SHOP_NAME } from "@lib/constants"
import { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

export const legalMetadata = async (slug: LegalSlug): Promise<Metadata> => {
  const document = await getLegalDocument(slug)
  return { title: `${document?.title ?? ""} | ${SHOP_NAME}` }
}

const LegalPage = async ({ slug }: { slug: LegalSlug }) => {
  const document = await getLegalDocument(slug)
  const locale = await getLocale()
  const t = await getTranslations("legal")

  if (!document) {
    notFound()
  }

  return (
    <article className="content-container py-12 small:py-16">
      <div className="max-w-3xl">
        {locale !== "de" && (
          <p
            className="mb-8 rounded-xl border border-brand/20 bg-brand/5 p-4 txt-small text-ui-fg-subtle"
            lang="en"
          >
            {t("germanOnly")}
          </p>
        )}
        <h1 className="text-3xl leading-10 mb-8 text-ui-fg-base" lang="de">
          {document.title}
        </h1>
        <div className="flex flex-col gap-y-3 txt-medium text-ui-fg-subtle" lang="de">
          {document.blocks.map((block, index) => {
            switch (block.type) {
              case "h2":
                return (
                  <h2 key={index} className="txt-xlarge-plus text-ui-fg-base mt-6">
                    {block.text}
                  </h2>
                )
              case "h3":
                return (
                  <h3 key={index} className="txt-large-plus text-ui-fg-base mt-4">
                    {block.text}
                  </h3>
                )
              case "p":
                return <p key={index}>{block.text}</p>
              case "lines":
                return (
                  <p key={index}>
                    {block.lines.map((line, i) => (
                      <span key={i} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                )
              case "list":
                return (
                  <ul key={index} className="list-disc pl-6 flex flex-col gap-y-1">
                    {block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )
            }
          })}
        </div>
        <p className="mt-10 txt-small text-ui-fg-muted">
          {t("updated", { date: document.updated })}
        </p>
      </div>
    </article>
  )
}

export default LegalPage
