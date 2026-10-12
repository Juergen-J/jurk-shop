import LegalPage, { legalMetadata } from "@modules/legal/components/legal-page"

export const generateMetadata = () => legalMetadata("impressum")

export default function Page() {
  return <LegalPage slug="impressum" />
}
