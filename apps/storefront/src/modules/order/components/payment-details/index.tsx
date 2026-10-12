import { Container, Heading, Text } from "@modules/common/components/ui"

import { isManual, isStripeLike, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const t = useTranslations("checkout")
  const tPayment = useTranslations("payment")
  const payment = order.payment_collections?.[0].payments?.[0]
  const session = order.payment_collections?.[0]?.payment_sessions?.[0]
  const providerId = payment?.provider_id ?? session?.provider_id

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        {t("payment")}
      </Heading>
      <div>
        {providerId && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {t("paymentMethod")}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method"
              >
                {paymentInfoMap[providerId]
                  ? tPayment(`methods.${paymentInfoMap[providerId].title}`)
                  : providerId}
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                {t("paymentDetails")}
              </Text>
              <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {paymentInfoMap[providerId]?.icon}
                </Container>
                <Text data-testid="payment-amount">
                  {!payment || (isManual(providerId) && !payment.captured_at)
                    ? tPayment("awaitingTransfer")
                    : isStripeLike(payment.provider_id) &&
                      payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : tPayment("paidAt", {
                        amount: convertToLocale({
                          amount: payment.amount,
                          currency_code: order.currency_code,
                        }),
                        date: new Date(
                          payment.created_at ?? ""
                        ).toLocaleDateString("de-DE"),
                      })}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
