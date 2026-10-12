import LegalPage, { legalMetadata } from "@modules/legal/components/legal-page"

export const generateMetadata = () => legalMetadata("datenschutz")

export default function Page() {
  return <LegalPage slug="datenschutz" />
}
