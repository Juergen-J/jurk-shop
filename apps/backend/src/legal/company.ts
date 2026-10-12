/** Seller details used in the legal pages and emails (from jurk.pro/impressum). */
export const COMPANY = {
  name: "Jürgen Jurk Digital Services",
  owner: "Jürgen Jurk",
  street: "Simpsonweg 19A",
  postalCode: "12305",
  city: "Berlin",
  country: "Deutschland",
  phone: "+49 1798 159192",
  email: "info@jurk.pro",
  shopName: "JURK.PRO Shop",
  shopUrl: process.env.STOREFRONT_URL || "http://localhost:8000",
  /** Leave empty if there is none; shown in the Impressum when set. */
  vatId: "",
  /**
   * Kleinunternehmer (§ 19 UStG): no VAT is charged or shown. When this
   * changes, also update the tax rate in the admin (Settings > Tax Regions >
   * Germany) and SMALL_BUSINESS in the storefront (src/lib/constants.tsx).
   */
  smallBusiness: true,
}

export const SMALL_BUSINESS_NOTE =
  "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."

export const companyAddressLines = () => [
  COMPANY.name,
  `Inhaber: ${COMPANY.owner}`,
  COMPANY.street,
  `${COMPANY.postalCode} ${COMPANY.city}`,
]
