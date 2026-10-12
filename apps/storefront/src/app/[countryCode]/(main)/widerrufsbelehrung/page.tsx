import LegalPage, { legalMetadata } from "@modules/legal/components/legal-page"

export const generateMetadata = () => legalMetadata("widerrufsbelehrung")

export default function Page() {
  return <LegalPage slug="widerrufsbelehrung" />
}
