import { Cash, CreditCard } from "@medusajs/icons"
import Bancontact from "@modules/common/icons/bancontact"
import Ideal from "@modules/common/icons/ideal"
import PayPal from "@modules/common/icons/paypal"
import React from "react"

export const SHOP_NAME = "JURK.PRO Shop"
export const CONTACT_EMAIL = "info@jurk.pro"
/**
 * Kleinunternehmer (§ 19 UStG): no VAT is shown. Keep in sync with
 * COMPANY.smallBusiness in the backend (src/legal/company.ts).
 */
export const SMALL_BUSINESS = true

/* Map of payment provider_id to its translation key (payment.methods.*) and icon. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "ideal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "paypal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "manual",
    icon: <Cash />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
