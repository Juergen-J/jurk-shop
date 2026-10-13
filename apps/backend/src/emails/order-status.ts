import { COMPANY } from "../legal/company"
import { EmailLocale } from "./i18n"

/** Emails about an order after it was placed: paid, shipped, canceled. */
export type OrderStatusKind = "payment-received" | "shipped" | "canceled"

export type OrderStatusEmailData = {
  displayId: string
  customerName: string
  /** "4–6 Werktage", for payment-received */
  productionDays?: string
  trackingNumber?: string
  trackingUrl?: string
}

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const texts = {
  de: {
    greeting: (name: string) => (name ? `Hallo ${name},` : "Hallo,"),
    questions: `Fragen zu deiner Bestellung? Antworte einfach auf diese E-Mail oder schreib uns an ${COMPANY.email}.`,
    closing: `Viele Grüße\n${COMPANY.owner}`,
    "payment-received": {
      subject: (n: string) => `Zahlung eingegangen – Bestellung #${n}`,
      body: (d: OrderStatusEmailData) => [
        `deine Zahlung für die Bestellung #${d.displayId} ist bei uns eingegangen, vielen Dank! Wir beginnen jetzt mit dem Druck deiner Boxen.`,
        d.productionDays
          ? `Die Herstellung dauert ca. ${d.productionDays}. Sobald dein Paket unterwegs ist, bekommst du eine E-Mail mit der Sendungsnummer.`
          : "Sobald dein Paket unterwegs ist, bekommst du eine E-Mail mit der Sendungsnummer.",
      ],
    },
    shipped: {
      subject: (n: string) => `Deine Bestellung #${n} ist unterwegs`,
      body: (d: OrderStatusEmailData) => [
        `deine Bestellung #${d.displayId} ist fertig und auf dem Weg zu dir. Die Zustellung mit DHL dauert in der Regel 1–2 Werktage.`,
      ],
      tracking: "Sendungsnummer",
      track: "Sendung verfolgen",
    },
    canceled: {
      subject: (n: string) => `Bestellung #${n} storniert`,
      body: (d: OrderStatusEmailData) => [
        `deine Bestellung #${d.displayId} wurde storniert.`,
        "Falls du bereits bezahlt hast, erstatten wir dir den Betrag in den nächsten Tagen auf das Konto, von dem die Zahlung kam.",
      ],
    },
  },
  en: {
    greeting: (name: string) => (name ? `Hi ${name},` : "Hi,"),
    questions: `Questions about your order? Just reply to this email or write to ${COMPANY.email}.`,
    closing: `Best regards\n${COMPANY.owner}`,
    "payment-received": {
      subject: (n: string) => `Payment received – order #${n}`,
      body: (d: OrderStatusEmailData) => [
        `we have received your payment for order #${d.displayId}, thank you! We are now printing your boxes.`,
        d.productionDays
          ? `Production takes about ${d.productionDays}. As soon as your parcel is on its way, you'll get an email with the tracking number.`
          : "As soon as your parcel is on its way, you'll get an email with the tracking number.",
      ],
    },
    shipped: {
      subject: (n: string) => `Your order #${n} is on its way`,
      body: (d: OrderStatusEmailData) => [
        `your order #${d.displayId} is ready and on its way to you. DHL usually delivers within 1–2 business days.`,
      ],
      tracking: "Tracking number",
      track: "Track parcel",
    },
    canceled: {
      subject: (n: string) => `Order #${n} canceled`,
      body: (d: OrderStatusEmailData) => [
        `your order #${d.displayId} has been canceled.`,
        "If you have already paid, we will refund the amount to the account the payment came from within the next few days.",
      ],
    },
  },
}

export const layout = (content: string) => `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#3f3f46;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    <div style="font-weight:600;font-size:16px;color:#18181b;margin-bottom:24px;">${escape(COMPANY.shopName)}</div>
    ${content}
    <p style="margin:32px 0 0;color:#a1a1aa;font-size:12px;">${escape(COMPANY.name)} · ${escape(COMPANY.street)} · ${escape(COMPANY.postalCode)} ${escape(COMPANY.city)} · ${escape(COMPANY.email)}</p>
  </div>
</body></html>`

const paragraph = (text: string) => `<p style="margin:0 0 16px;">${escape(text)}</p>`
const button = (href: string, label: string) =>
  `<p style="margin:8px 0 24px;"><a href="${escape(href)}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">${escape(label)}</a></p>`

/** DHL tracking page for a parcel number, in the email's language. */
export const dhlTrackingUrl = (trackingNumber: string, locale: EmailLocale) =>
  `https://www.dhl.de/${locale}/privatkunden/dhl-sendungsverfolgung.html?piececode=${encodeURIComponent(trackingNumber)}`

export const renderOrderStatus = (
  kind: OrderStatusKind,
  data: OrderStatusEmailData,
  locale: EmailLocale
) => {
  const t = texts[locale]
  const k = t[kind]

  let content = `<p style="margin:0 0 12px;font-size:16px;color:#18181b;">${escape(t.greeting(data.customerName))}</p>`
  content += k.body(data).map(paragraph).join("")

  if (kind === "shipped" && data.trackingNumber) {
    const shipped = t.shipped
    content += paragraph(`${shipped.tracking}: ${data.trackingNumber}`)
    content += button(
      data.trackingUrl || dhlTrackingUrl(data.trackingNumber, locale),
      shipped.track
    )
  }

  content += paragraph(t.questions)
  content += `<p style="margin:0;white-space:pre-line;">${escape(t.closing)}</p>`

  return { subject: k.subject(data.displayId), html: layout(content) }
}

/** Password reset for the admin (German, the admin is the shop owner). */
export const renderAdminPasswordReset = (resetUrl: string) => ({
  subject: `Passwort zurücksetzen – ${COMPANY.shopName} Admin`,
  html: layout(
    paragraph("Hallo,") +
      paragraph(
        "für dein Konto im Admin wurde ein neues Passwort angefordert. Über den folgenden Link kannst du es festlegen. Der Link ist nur kurze Zeit gültig."
      ) +
      button(resetUrl, "Neues Passwort festlegen") +
      paragraph(
        "Falls du das nicht warst, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert."
      )
  ),
})
