import { BankDetails } from "../utils/shop-settings"
import { ProductionTier } from "../utils/production-tiers"
import { EmailLocale, messages } from "./i18n"
import { LEGAL_DOCUMENTS } from "../legal/documents"
import { renderLegalHtml } from "../legal/render"
import { COMPANY } from "../legal/company"

export type EmailOrderItem = {
  title: string
  options: { title: string; value: string }[]
  /** Colors the customer asked for ("Andere Farbe (nach Anfrage)") */
  requestedColor?: string
  quantity: number
  total: number
}

export type EmailOrder = {
  displayId: string
  email: string
  createdAt: Date
  customerName: string
  items: EmailOrderItem[]
  itemTotal: number
  discountTotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  shippingAddress: string[]
  shippingMethod: string
  isManualPayment: boolean
}

export type OrderEmailContext = {
  order: EmailOrder
  locale: EmailLocale
  bank: BankDetails
  production: ProductionTier | null
  boxCount: number
  contactEmail: string
}

const BRAND = "#1F5EFF"

const money = (amount: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    amount
  )

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const row = (label: string, value: string, strong = false) => `
  <tr>
    <td style="padding:4px 0;color:#52525b;">${escape(label)}</td>
    <td style="padding:4px 0;text-align:right;${strong ? "font-weight:600;font-size:16px;color:#18181b;" : "color:#18181b;"}">${escape(value)}</td>
  </tr>`

const section = (title: string, body: string) => `
  <tr><td style="padding:24px 32px 0;">
    <h2 style="margin:0 0 12px;font-size:16px;color:#18181b;">${escape(title)}</h2>
    ${body}
  </td></tr>`

const layout = (content: string, footer: string) => `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
          <span style="display:inline-block;width:28px;height:28px;line-height:28px;border-radius:8px;background:${BRAND};color:#fff;font-weight:700;font-size:11px;text-align:center;vertical-align:middle;">JJ</span>
          <span style="font-weight:600;font-size:16px;color:#18181b;vertical-align:middle;margin-left:8px;">JURK.PRO Shop</span>
        </td></tr>
        ${content}
        <tr><td style="padding:32px;color:#a1a1aa;font-size:12px;">${escape(footer)}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const itemsTable = (ctx: OrderEmailContext) => {
  const t = messages[ctx.locale]
  const { order } = ctx

  const items = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;vertical-align:top;">
          <div style="font-weight:600;color:#18181b;">${escape(item.title)}</div>
          ${item.options
            .map(
              (o) =>
                `<div style="color:#71717a;font-size:13px;">${escape(o.title)}: ${escape(o.value)}</div>`
            )
            .join("")}
          ${
            item.requestedColor
              ? `<div style="color:#71717a;font-size:13px;">${escape(t.requestedColor)}: ${escape(item.requestedColor)}</div>`
              : ""
          }
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;text-align:center;vertical-align:top;color:#52525b;white-space:nowrap;">${item.quantity} ×</td>
        <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;text-align:right;vertical-align:top;color:#18181b;white-space:nowrap;">${money(item.total)}</td>
      </tr>`
    )
    .join("")

  const totals = [
    row(t.subtotal, money(order.itemTotal + order.discountTotal)),
    order.discountTotal > 0 ? row(t.discount, `− ${money(order.discountTotal)}`) : "",
    row(t.shipping, order.shippingTotal > 0 ? money(order.shippingTotal) : t.free),
    row(t.total, money(order.total), true),
    COMPANY.smallBusiness
      ? `<tr><td colspan="2" style="padding:0;color:#a1a1aa;font-size:12px;">${escape(t.smallBusinessNote)}</td></tr>`
      : `<tr><td style="padding:0;color:#a1a1aa;font-size:12px;">${escape(t.includedVat)}</td><td style="padding:0;text-align:right;color:#a1a1aa;font-size:12px;">${money(order.taxTotal)}</td></tr>`,
  ].join("")

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${totals}</table>`
}

const bankBox = (ctx: OrderEmailContext) => {
  const t = messages[ctx.locale]
  const { bank, order } = ctx
  const amount = money(order.total)

  const rows = bank.iban
    ? [
        [t.holder, bank.holder],
        [t.iban, bank.iban],
        [t.bic, bank.bic],
        [t.bank, bank.name],
        [t.amount, amount],
        [t.reference, t.referenceValue(order.displayId)],
      ]
        .filter(([, value]) => value)
        .map(([label, value]) => row(label, value))
        .join("")
    : ""

  return `
  <tr><td style="padding:24px 32px 0;">
    <div style="border:1px solid #c7d7ff;background:#f3f6ff;border-radius:12px;padding:16px 20px;">
      <div style="font-weight:600;font-size:15px;color:#18181b;margin-bottom:6px;">${escape(t.bankTitle)}</div>
      <div style="color:#52525b;">${escape(bank.iban ? t.bankText(amount) : t.bankMissing)}</div>
      ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">${rows}</table>` : ""}
    </div>
  </td></tr>`
}

export const renderOrderConfirmation = (ctx: OrderEmailContext) => {
  const t = messages[ctx.locale]
  const { order } = ctx

  const content = [
    `<tr><td style="padding:32px 32px 0;color:#18181b;">
      <p style="margin:0 0 12px;font-size:16px;">${escape(t.greeting(order.customerName))}</p>
      <p style="margin:0 0 16px;color:#3f3f46;">${escape(t.intro)}</p>
      <p style="margin:0;color:#52525b;">${escape(t.orderNumber)}: <strong style="color:${BRAND};">#${escape(order.displayId)}</strong><br>
      ${escape(t.orderDate)}: ${order.createdAt.toLocaleDateString(ctx.locale === "en" ? "en-GB" : "de-DE", { day: "numeric", month: "long", year: "numeric" })}</p>
    </td></tr>`,
    order.isManualPayment ? bankBox(ctx) : "",
    section(t.items, itemsTable(ctx)),
    ctx.production
      ? section(
          t.productionTitle,
          `<p style="margin:0;color:#3f3f46;">${escape(
            t.productionText(
              ctx.boxCount,
              t.days(ctx.production.min_days, ctx.production.max_days)
            )
          )}</p>`
        )
      : "",
    section(
      t.shippingAddress,
      `<p style="margin:0;color:#3f3f46;">${order.shippingAddress.map(escape).join("<br>")}</p>
       <p style="margin:12px 0 0;color:#52525b;">${escape(t.shippingMethod)}: ${escape(order.shippingMethod)}<br>
       ${escape(t.payment)}: ${escape(order.isManualPayment ? t.manualPayment : "-")}</p>`
    ),
    `<tr><td style="padding:24px 32px 0;color:#3f3f46;">
      <p style="margin:0 0 12px;">${escape(t.questions(ctx.contactEmail))}</p>
      <p style="margin:0;white-space:pre-line;">${escape(t.closing)}</p>
    </td></tr>`,
    // Contract confirmation on a durable medium (§ 312f BGB): terms and
    // cancellation policy, always in the binding German version.
    `<tr><td style="padding:32px 32px 0;">
      <div style="border-top:1px solid #e4e4e7;padding-top:16px;color:#52525b;font-size:12px;line-height:1.5;">
        <p style="margin:0 0 8px;">${escape(t.legalIntro)}</p>
        ${renderLegalHtml(LEGAL_DOCUMENTS.widerrufsbelehrung)}
        ${renderLegalHtml(LEGAL_DOCUMENTS.agb)}
      </div>
    </td></tr>`,
  ].join("")

  return {
    subject: t.subject(order.displayId),
    html: layout(
      content,
      `JURK.PRO Shop · ${ctx.contactEmail} · ${
        COMPANY.smallBusiness ? t.smallBusinessFooter : t.footer
      }`
    ),
  }
}

/** Short notification for the shop owner, always in German. */
export const renderNewOrderNotification = (ctx: OrderEmailContext) => {
  const t = messages.de
  const { order } = ctx

  const content = [
    `<tr><td style="padding:32px 32px 0;color:#18181b;">
      <p style="margin:0 0 12px;font-size:16px;">${escape(t.adminIntro)}</p>
      <p style="margin:0;color:#52525b;">${escape(t.orderNumber)}: <strong>#${escape(order.displayId)}</strong><br>
      ${escape(t.adminCustomer)}: ${escape(order.customerName)} &lt;${escape(order.email)}&gt;<br>
      ${escape(t.payment)}: ${escape(order.isManualPayment ? t.manualPayment : "-")}</p>
    </td></tr>`,
    section(t.items, itemsTable({ ...ctx, locale: "de" })),
    section(
      t.shippingAddress,
      `<p style="margin:0;color:#3f3f46;">${order.shippingAddress.map(escape).join("<br>")}</p>`
    ),
  ].join("")

  return {
    subject: t.adminSubject(order.displayId, money(order.total)),
    html: layout(content, "JURK.PRO Shop"),
  }
}
