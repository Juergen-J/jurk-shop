import { COMPANY } from "../legal/company"
import { EmailLocale } from "./i18n"

export type WithdrawalEmailData = {
  name: string
  email: string
  orderNumber: string
  items: string | null
  receivedAt: Date
}

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const formatReceived = (date: Date, locale: EmailLocale) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-DE", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date) + " (MEZ/MESZ)"

const texts = {
  de: {
    subject: (n: string) => `Eingangsbestätigung Ihres Widerrufs (Bestellung ${n})`,
    greeting: (name: string) => `Hallo ${name},`,
    intro:
      "hiermit bestätigen wir den Eingang Ihrer Widerrufserklärung, die Sie über unsere Online-Widerrufsfunktion abgegeben haben.",
    declaration: "Inhalt Ihrer Widerrufserklärung",
    declarationText: "Hiermit widerrufe ich den von mir abgeschlossenen Vertrag.",
    name: "Name",
    email: "E-Mail",
    order: "Bestellnummer",
    items: "Widerrufene Artikel",
    allItems: "Gesamte Bestellung",
    received: "Eingegangen am",
    returnTitle: "So geht es weiter",
    returnText: `Bitte senden Sie die Ware innerhalb von 14 Tagen an ${COMPANY.name}, ${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city} zurück. Die unmittelbaren Kosten der Rücksendung tragen Sie. Die Rückzahlung erfolgt gemäß unserer Widerrufsbelehrung.`,
    note: "Diese E-Mail bestätigt ausschließlich den Eingang Ihrer Erklärung.",
    closing: `Viele Grüße\n${COMPANY.owner}`,
  },
  en: {
    subject: (n: string) => `Confirmation of receipt of your withdrawal (order ${n})`,
    greeting: (name: string) => `Hi ${name},`,
    intro:
      "we hereby confirm receipt of the withdrawal you submitted through our online withdrawal function.",
    declaration: "Content of your withdrawal",
    declarationText: "I hereby withdraw from the contract concluded by me.",
    name: "Name",
    email: "Email",
    order: "Order number",
    items: "Withdrawn items",
    allItems: "Entire order",
    received: "Received on",
    returnTitle: "Next steps",
    returnText: `Please return the goods within 14 days to ${COMPANY.name}, ${COMPANY.street}, ${COMPANY.postalCode} ${COMPANY.city}, Germany. You bear the direct cost of returning the goods. We will refund you as described in our cancellation policy.`,
    note: "This email only confirms receipt of your declaration.",
    closing: `Best regards\n${COMPANY.owner}`,
  },
}

const table = (rows: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#52525b;vertical-align:top;white-space:nowrap;">${escape(label)}</td><td style="padding:4px 0;color:#18181b;">${escape(value)}</td></tr>`
    )
    .join("")}</table>`

const layout = (content: string) => `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#3f3f46;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    <div style="font-weight:600;font-size:16px;color:#18181b;margin-bottom:24px;">${escape(COMPANY.shopName)}</div>
    ${content}
    <p style="margin:32px 0 0;color:#a1a1aa;font-size:12px;">${escape(COMPANY.name)} · ${escape(COMPANY.street)} · ${escape(COMPANY.postalCode)} ${escape(COMPANY.city)} · ${escape(COMPANY.email)}</p>
  </div>
</body></html>`

export const renderWithdrawalConfirmation = (
  data: WithdrawalEmailData,
  locale: EmailLocale
) => {
  const t = texts[locale]

  const content = `
    <p style="margin:0 0 12px;font-size:16px;color:#18181b;">${escape(t.greeting(data.name))}</p>
    <p style="margin:0 0 20px;">${escape(t.intro)}</p>
    <h2 style="margin:0 0 8px;font-size:15px;color:#18181b;">${escape(t.declaration)}</h2>
    <p style="margin:0 0 8px;">„${escape(t.declarationText)}“</p>
    ${table([
      [t.name, data.name],
      [t.email, data.email],
      [t.order, data.orderNumber],
      [t.items, data.items || t.allItems],
      [t.received, formatReceived(data.receivedAt, locale)],
    ])}
    <h2 style="margin:24px 0 8px;font-size:15px;color:#18181b;">${escape(t.returnTitle)}</h2>
    <p style="margin:0 0 12px;">${escape(t.returnText)}</p>
    <p style="margin:0 0 20px;color:#71717a;">${escape(t.note)}</p>
    <p style="margin:0;white-space:pre-line;">${escape(t.closing)}</p>`

  return { subject: t.subject(data.orderNumber), html: layout(content) }
}

/** Notification for the shop owner, always German. */
export const renderWithdrawalNotification = (
  data: WithdrawalEmailData,
  orderFound: boolean
) => {
  const t = texts.de

  const content = `
    <p style="margin:0 0 16px;font-size:16px;color:#18181b;">Es ist ein Widerruf über die Online-Widerrufsfunktion eingegangen.</p>
    ${table([
      [t.name, data.name],
      [t.email, data.email],
      [t.order, data.orderNumber],
      [t.items, data.items || t.allItems],
      [t.received, formatReceived(data.receivedAt, "de")],
      [
        "Bestellung gefunden",
        orderFound
          ? "Ja (Bestellnummer und E-Mail passen)"
          : "Nein – bitte manuell prüfen",
      ],
    ])}
    <p style="margin:16px 0 0;">Der Kunde hat automatisch eine Eingangsbestätigung erhalten. Alle Widerrufe findest du im Admin unter „Widerrufe“.</p>`

  return {
    subject: `Widerruf eingegangen: Bestellung ${data.orderNumber}`,
    html: layout(content),
  }
}
