export type EmailLocale = "de" | "en"

export const toEmailLocale = (locale?: string | null): EmailLocale =>
  locale?.toLowerCase().startsWith("en") ? "en" : "de"

type Messages = {
  subject: (n: string) => string
  greeting: (name: string) => string
  intro: string
  orderNumber: string
  orderDate: string
  items: string
  quantity: string
  subtotal: string
  discount: string
  shipping: string
  free: string
  total: string
  includedVat: string
  smallBusinessNote: string
  smallBusinessFooter: string
  shippingAddress: string
  shippingMethod: string
  payment: string
  manualPayment: string
  bankTitle: string
  bankText: (amount: string) => string
  bankMissing: string
  holder: string
  iban: string
  bic: string
  bank: string
  amount: string
  reference: string
  referenceValue: (n: string) => string
  productionTitle: string
  productionText: (count: number, days: string) => string
  days: (min: number, max: number) => string
  questions: (email: string) => string
  closing: string
  footer: string
  legalIntro: string
  adminSubject: (n: string, total: string) => string
  adminIntro: string
  adminCustomer: string
  requestedColor: string
}

export const messages: Record<EmailLocale, Messages> = {
  de: {
    subject: (n) => `Deine Bestellung #${n} bei JURK.PRO Shop`,
    greeting: (name) => (name ? `Hallo ${name},` : "Hallo,"),
    intro:
      "vielen Dank für deine Bestellung! Wir haben sie erhalten und drucken deine Boxen, sobald die Zahlung eingegangen ist.",
    orderNumber: "Bestellnummer",
    orderDate: "Bestelldatum",
    items: "Deine Bestellung",
    quantity: "Menge",
    subtotal: "Zwischensumme",
    discount: "Rabatt",
    shipping: "Versand",
    free: "kostenlos",
    total: "Gesamtsumme",
    includedVat: "darin enthaltene MwSt.",
    smallBusinessNote: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
    smallBusinessFooter: "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
    shippingAddress: "Lieferadresse",
    shippingMethod: "Versandart",
    payment: "Zahlungsart",
    manualPayment: "Vorkasse (Überweisung)",
    bankTitle: "Bitte überweise den Rechnungsbetrag",
    bankText: (amount) =>
      `Bitte überweise ${amount} auf folgendes Konto. Gib als Verwendungszweck deine Bestellnummer an.`,
    bankMissing:
      "Unsere Bankverbindung senden wir dir in einer separaten E-Mail. Bitte gib als Verwendungszweck deine Bestellnummer an.",
    holder: "Kontoinhaber",
    iban: "IBAN",
    bic: "BIC",
    bank: "Bank",
    amount: "Betrag",
    reference: "Verwendungszweck",
    referenceValue: (n) => `Bestellung ${n}`,
    productionTitle: "Herstellung & Versand",
    productionText: (count, days) =>
      `Für ${count === 1 ? "1 Box" : `${count} Boxen`} benötigen wir ca. ${days} ab Zahlungseingang. Danach verschicken wir dein Paket mit DHL (1–2 Werktage).`,
    days: (min, max) =>
      min === max ? `${min} ${min === 1 ? "Werktag" : "Werktage"}` : `${min}–${max} Werktage`,
    questions: (email) => `Fragen zu deiner Bestellung? Schreib uns an ${email}.`,
    closing: "Viele Grüße\nJürgen Jurk",
    footer: "Alle Preise inkl. MwSt.",
    legalIntro:
      "Nachfolgend erhältst du unsere Widerrufsbelehrung und unsere Allgemeinen Geschäftsbedingungen, die Bestandteil deines Vertrags sind.",
    adminSubject: (n, total) => `Neue Bestellung #${n} (${total})`,
    adminIntro: "Es ist eine neue Bestellung eingegangen.",
    adminCustomer: "Kunde",
    requestedColor: "Wunschfarbe",
  },
  en: {
    subject: (n) => `Your order #${n} at JURK.PRO Shop`,
    greeting: (name) => (name ? `Hi ${name},` : "Hi,"),
    intro:
      "thank you for your order! We have received it and will print your boxes as soon as your payment has arrived.",
    orderNumber: "Order number",
    orderDate: "Order date",
    items: "Your order",
    quantity: "Qty",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping",
    free: "free",
    total: "Total",
    includedVat: "incl. VAT",
    smallBusinessNote: "No VAT is charged (small business under § 19 UStG).",
    smallBusinessFooter: "No VAT is charged (small business under § 19 UStG).",
    shippingAddress: "Shipping address",
    shippingMethod: "Shipping method",
    payment: "Payment method",
    manualPayment: "Bank transfer (prepayment)",
    bankTitle: "Please transfer the order amount",
    bankText: (amount) =>
      `Please transfer ${amount} to the account below and use your order number as the payment reference.`,
    bankMissing:
      "We will send you our bank details in a separate email. Please use your order number as the payment reference.",
    holder: "Account holder",
    iban: "IBAN",
    bic: "BIC",
    bank: "Bank",
    amount: "Amount",
    reference: "Payment reference",
    referenceValue: (n) => `Order ${n}`,
    productionTitle: "Production & shipping",
    productionText: (count, days) =>
      `For ${count === 1 ? "1 box" : `${count} boxes`} we need about ${days} after your payment has arrived. Then we ship your parcel with DHL (1–2 business days).`,
    days: (min, max) =>
      min === max
        ? `${min} business ${min === 1 ? "day" : "days"}`
        : `${min}–${max} business days`,
    questions: (email) => `Questions about your order? Email us at ${email}.`,
    closing: "Best regards\nJürgen Jurk",
    footer: "All prices incl. VAT.",
    legalIntro:
      "Below you will find our cancellation policy and our terms and conditions, which form part of your contract. Only the German version is legally binding.",
    adminSubject: (n, total) => `New order #${n} (${total})`,
    adminIntro: "A new order has been placed.",
    adminCustomer: "Customer",
    requestedColor: "Requested colors",
  },
}
