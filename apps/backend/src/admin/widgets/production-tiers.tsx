import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminStore, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Button,
  Container,
  Heading,
  IconButton,
  Input,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/sdk"
import {
  parseProductionTiers,
  PRODUCTION_TIERS_KEY,
  ProductionTier,
  sortTiers,
} from "../../utils/production-tiers"

type Row = { max: string; min_days: string; max_days: string }

const toRows = (tiers: ProductionTier[]): Row[] =>
  tiers.map((tier) => ({
    max: tier.max === null ? "" : String(tier.max),
    min_days: String(tier.min_days),
    max_days: String(tier.max_days),
  }))

const toTiers = (rows: Row[]): ProductionTier[] | null => {
  const tiers = rows.map((row) => ({
    max: row.max.trim() === "" ? null : Number(row.max),
    min_days: Number(row.min_days),
    max_days: Number(row.max_days),
  }))

  const valid =
    tiers.length > 0 &&
    tiers.filter((tier) => tier.max === null).length === 1 &&
    tiers.every(
      (tier) =>
        (tier.max === null || (Number.isInteger(tier.max) && tier.max > 0)) &&
        Number.isInteger(tier.min_days) &&
        Number.isInteger(tier.max_days) &&
        tier.min_days > 0 &&
        tier.min_days <= tier.max_days
    )

  return valid ? sortTiers(tiers) : null
}

const ProductionTiersWidget = ({ data }: DetailWidgetProps<AdminStore>) => {
  const [rows, setRows] = useState<Row[]>(() =>
    toRows(parseProductionTiers(data.metadata?.[PRODUCTION_TIERS_KEY]))
  )

  const { mutate, isPending } = useMutation({
    mutationFn: (tiers: ProductionTier[]) =>
      sdk.admin.store.update(data.id, {
        metadata: {
          ...(data.metadata ?? {}),
          [PRODUCTION_TIERS_KEY]: JSON.stringify(tiers),
        },
      }),
    onSuccess: (_, tiers) => {
      setRows(toRows(tiers))
      toast.success("Herstellungszeiten gespeichert")
    },
    onError: (error) => toast.error(error.message),
  })

  const update = (index: number, field: keyof Row, value: string) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )

  const save = () => {
    const tiers = toTiers(rows)

    if (!tiers) {
      toast.error(
        "Bitte nur ganze Zahlen eintragen, min <= max, und genau eine Zeile ohne Obergrenze."
      )
      return
    }

    mutate(tiers)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Herstellungszeit</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Werktage bis zum Versand, abhängig von der Anzahl Boxen im
            Warenkorb. Leeres Feld "Bis Boxen" = alle darüber.
          </Text>
        </div>
        <Button size="small" onClick={save} isLoading={isPending}>
          Speichern
        </Button>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Bis Boxen</Table.HeaderCell>
            <Table.HeaderCell>Min. Werktage</Table.HeaderCell>
            <Table.HeaderCell>Max. Werktage</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, index) => (
            <Table.Row key={index}>
              {(["max", "min_days", "max_days"] as const).map((field) => (
                <Table.Cell key={field}>
                  <Input
                    size="small"
                    type="number"
                    min={1}
                    value={row[field]}
                    placeholder={field === "max" ? "unbegrenzt" : undefined}
                    onChange={(e) => update(index, field, e.target.value)}
                  />
                </Table.Cell>
              ))}
              <Table.Cell>
                <IconButton
                  size="small"
                  variant="transparent"
                  disabled={rows.length === 1}
                  onClick={() =>
                    setRows((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash />
                </IconButton>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div className="px-6 py-3">
        <Button
          size="small"
          variant="transparent"
          onClick={() =>
            setRows((prev) => [...prev, { max: "", min_days: "", max_days: "" }])
          }
        >
          <Plus />
          Zeile hinzufügen
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "store.details.after",
})

export default ProductionTiersWidget
