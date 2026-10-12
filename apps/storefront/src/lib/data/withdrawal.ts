"use server"

import { sdk } from "@lib/config"
import { getLocale } from "./locale-actions"

export type WithdrawalInput = {
  name: string
  email: string
  order_number: string
  items?: string
}

export type WithdrawalReceipt = {
  id: string
  name: string
  email: string
  order_number: string
  items: string | null
  received_at: string
}

/** Submits a withdrawal through the online withdrawal function (§ 356a BGB). */
export async function submitWithdrawal(
  input: WithdrawalInput
): Promise<{ receipt?: WithdrawalReceipt; error?: string }> {
  return sdk.client
    .fetch<{ withdrawal: WithdrawalReceipt }>(`/store/withdrawals`, {
      method: "POST",
      body: { ...input, locale: (await getLocale()) ?? "de-DE" },
    })
    .then(({ withdrawal }) => ({ receipt: withdrawal }))
    .catch((err) => ({ error: err?.message ?? String(err) }))
}
