import { Metadata } from "next"

import NotFoundContent from "@modules/common/components/not-found-content"

export const metadata: Metadata = {
  title: "404",
}

export default function NotFound() {
  return <NotFoundContent />
}
