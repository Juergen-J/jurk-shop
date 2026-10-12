import LegalPage, { legalMetadata } from "@modules/legal/components/legal-page"

export const generateMetadata = () => legalMetadata("agb")

export default function Page() {
  return <LegalPage slug="agb" />
}
