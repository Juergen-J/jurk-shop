import Medusa from "@medusajs/js-sdk"

// The admin is served by the backend itself, so the API is on the same origin.
export const sdk = new Medusa({
  baseUrl: "/",
  auth: {
    type: "session",
  },
})
