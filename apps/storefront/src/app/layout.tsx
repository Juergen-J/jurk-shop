import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the page paint under the notch; header and bottom bars pad back with env(safe-area-inset-*)
  viewportFit: "cover",
  // Android: the keyboard shrinks the layout like on iOS, so bottom bars stay above it
  interactiveWidget: "resizes-content",
  // The shop is light-only (data-mode="light"); the status bar matches the white header
  themeColor: "#ffffff",
  colorScheme: "light",
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale} data-mode="light">
      <body>
        <NextIntlClientProvider>
          <main className="relative">{props.children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
