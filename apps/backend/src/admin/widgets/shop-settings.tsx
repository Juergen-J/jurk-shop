import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Button,
  Checkbox,
  Container,
  Heading,
  IconButton,
  Input,
  Label,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { sdk } from "../lib/sdk"
import type { ShopSettings } from "../../utils/shop-settings"

type DiscountRow = { min_total: string; percent: string }

type FormState = {
  bank: ShopSettings["bank"]
  invoice_separately: boolean
  order_notification_email: string
  free_shipping_enabled: boolean
  free_shipping_threshold: string
  volume_discounts: DiscountRow[]
}

const QUERY_KEY = ["shop-settings"]

const toForm = (settings: ShopSettings): FormState => ({
  bank: settings.bank,
  invoice_separately: settings.invoice_separately,
  order_notification_email: settings.order_notification_email,
  free_shipping_enabled: settings.free_shipping_threshold !== null,
  free_shipping_threshold:
    settings.free_shipping_threshold === null
      ? ""
      : String(settings.free_shipping_threshold),
  volume_discounts: settings.volume_discounts.map((d) => ({
    min_total: String(d.min_total),
    percent: String(d.percent),
  })),
})

// Accepts "49,90" as well as "49.90".
const parseAmount = (value: string) => Number(value.replace(",", ".").trim())

const toSettings = (form: FormState): ShopSettings | string => {
  const threshold = parseAmount(form.free_shipping_threshold)

  if (form.free_shipping_enabled && !(threshold > 0)) {
    return "Bitte einen Bestellwert für den kostenlosen Versand eintragen."
  }

  const discounts = form.volume_discounts.map((row) => ({
    min_total: parseAmount(row.min_total),
    percent: parseAmount(row.percent),
  }))

  if (
    discounts.some(
      (d) => !(d.min_total > 0) || !(d.percent > 0) || !(d.percent < 100)
    )
  ) {
    return "Mengenrabatt: Bestellwert > 0 und Rabatt zwischen 0 und 100 %."
  }

  if (new Set(discounts.map((d) => d.min_total)).size !== discounts.length) {
    return "Mengenrabatt: jeder Bestellwert darf nur einmal vorkommen."
  }

  return {
    bank: form.bank,
    invoice_separately: form.invoice_separately,
    order_notification_email: form.order_notification_email.trim(),
    free_shipping_threshold: form.free_shipping_enabled ? threshold : null,
    volume_discounts: discounts,
  }
}

const ShopSettingsWidget = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState | null>(null)

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      sdk.client.fetch<{ shop_settings: ShopSettings }>("/admin/shop-settings"),
  })

  useEffect(() => {
    if (data && !form) {
      setForm(toForm(data.shop_settings))
    }
  }, [data, form])

  const { mutate, isPending } = useMutation({
    mutationFn: (settings: ShopSettings) =>
      sdk.client.fetch<{ shop_settings: ShopSettings }>(
        "/admin/shop-settings",
        { method: "POST", body: settings }
      ),
    onSuccess: ({ shop_settings }) => {
      queryClient.setQueryData(QUERY_KEY, { shop_settings })
      setForm(toForm(shop_settings))
      toast.success("Einstellungen gespeichert")
    },
    onError: (error) => toast.error(error.message),
  })

  if (!form) {
    return null
  }

  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch })
  const setBank = (field: keyof FormState["bank"], value: string) =>
    set({ bank: { ...form.bank, [field]: value } })
  const setDiscount = (index: number, field: keyof DiscountRow, value: string) =>
    set({
      volume_discounts: form.volume_discounts.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      ),
    })

  const save = () => {
    const settings = toSettings(form)

    if (typeof settings === "string") {
      toast.error(settings)
      return
    }

    mutate(settings)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Zahlung, Versand & Rabatte</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Bankverbindung für Vorkasse, Benachrichtigungen, kostenloser
            Versand und automatischer Mengenrabatt.
          </Text>
        </div>
        <Button size="small" onClick={save} isLoading={isPending}>
          Speichern
        </Button>
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        <div>
          <Heading level="h3">Bankverbindung (Vorkasse)</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Wird auf der Bestellbestätigung und in der E-Mail angezeigt.
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["holder", "Kontoinhaber"],
              ["iban", "IBAN"],
              ["bic", "BIC"],
              ["name", "Bank"],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="flex flex-col gap-y-2">
              <Label size="small">{label}</Label>
              <Input
                size="small"
                value={form.bank[field]}
                onChange={(e) => setBank(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-y-2 px-6 py-4">
        <Heading level="h3">Rechnung</Heading>
        <div className="flex items-start gap-x-2">
          <Checkbox
            id="invoice-separately"
            checked={form.invoice_separately}
            onCheckedChange={(checked) =>
              set({ invoice_separately: checked === true })
            }
          />
          <Label htmlFor="invoice-separately" size="small">
            Rechnung kommt separat (z. B. aus Lexware). Kunden zahlen mit der
            Rechnungsnummer als Verwendungszweck; Bestätigung und Bestellseite
            zeigen dann keine Bankverbindung.
          </Label>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 px-6 py-4">
        <Heading level="h3">Benachrichtigung bei neuen Bestellungen</Heading>
        <Input
          size="small"
          type="email"
          placeholder="z. B. info@jurk.pro (leer = keine)"
          value={form.order_notification_email}
          onChange={(e) => set({ order_notification_email: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-y-3 px-6 py-4">
        <Heading level="h3">Kostenloser Versand</Heading>
        <div className="flex items-center gap-x-2">
          <Checkbox
            id="free-shipping"
            checked={form.free_shipping_enabled}
            onCheckedChange={(checked) =>
              set({ free_shipping_enabled: checked === true })
            }
          />
          <Label htmlFor="free-shipping" size="small">
            Kostenloser Versand ab Bestellwert
          </Label>
        </div>
        {form.free_shipping_enabled && (
          <div className="flex items-center gap-x-2 max-w-xs">
            <Input
              size="small"
              inputMode="decimal"
              value={form.free_shipping_threshold}
              onChange={(e) => set({ free_shipping_threshold: e.target.value })}
            />
            <Text size="small">€ (Endpreis)</Text>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-y-3 py-4">
        <div className="px-6">
          <Heading level="h3">Mengenrabatt</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Rabatt auf den Warenwert ab einem Bestellwert (Endpreis). Es
            gilt immer nur die höchste erreichte Stufe.
          </Text>
        </div>
        {form.volume_discounts.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Ab Bestellwert (€)</Table.HeaderCell>
                <Table.HeaderCell>Rabatt (%)</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {form.volume_discounts.map((row, index) => (
                <Table.Row key={index}>
                  {(["min_total", "percent"] as const).map((field) => (
                    <Table.Cell key={field}>
                      <Input
                        size="small"
                        inputMode="decimal"
                        value={row[field]}
                        onChange={(e) =>
                          setDiscount(index, field, e.target.value)
                        }
                      />
                    </Table.Cell>
                  ))}
                  <Table.Cell>
                    <IconButton
                      size="small"
                      variant="transparent"
                      onClick={() =>
                        set({
                          volume_discounts: form.volume_discounts.filter(
                            (_, i) => i !== index
                          ),
                        })
                      }
                    >
                      <Trash />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
        <div className="px-6">
          <Button
            size="small"
            variant="transparent"
            onClick={() =>
              set({
                volume_discounts: [
                  ...form.volume_discounts,
                  { min_total: "", percent: "" },
                ],
              })
            }
          >
            <Plus />
            Rabattstufe hinzufügen
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "store.details.after",
})

export default ShopSettingsWidget
