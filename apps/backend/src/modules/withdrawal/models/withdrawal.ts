import { model } from "@medusajs/framework/utils"

/**
 * A withdrawal (Widerruf) submitted through the online withdrawal function
 * (§ 356a BGB). Kept as evidence of what was declared and when.
 */
const Withdrawal = model.define("withdrawal", {
  id: model.id({ prefix: "wdr" }).primaryKey(),
  name: model.text(),
  email: model.text(),
  order_number: model.text(),
  /** Which items are withdrawn; empty means the whole order. */
  items: model.text().nullable(),
  /** The matching order, when number and email fit an existing order. */
  order_id: model.text().nullable(),
  locale: model.text().default("de"),
  status: model.enum(["received", "processed"]).default("received"),
})

export default Withdrawal
