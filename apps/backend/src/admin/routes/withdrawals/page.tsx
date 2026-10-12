import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowUturnLeft } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"

type Withdrawal = {
  id: string
  name: string
  email: string
  order_number: string
  items: string | null
  order_id: string | null
  status: "received" | "processed"
  created_at: string
}

const QUERY_KEY = ["withdrawals"]

const WithdrawalsPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      sdk.client.fetch<{ withdrawals: Withdrawal[] }>("/admin/withdrawals"),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Withdrawal["status"] }) =>
      sdk.client.fetch(`/admin/withdrawals/${id}`, {
        method: "POST",
        body: { status },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    onError: (error) => toast.error(error.message),
  })

  const withdrawals = data?.withdrawals ?? []

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Widerrufe</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Über die Online-Widerrufsfunktion eingegangene Widerrufe. Der Kunde
          erhält automatisch eine Eingangsbestätigung per E-Mail.
        </Text>
      </div>
      {isLoading ? null : withdrawals.length === 0 ? (
        <Text className="px-6 py-8 text-ui-fg-subtle">
          Noch keine Widerrufe eingegangen.
        </Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Eingang</Table.HeaderCell>
              <Table.HeaderCell>Kunde</Table.HeaderCell>
              <Table.HeaderCell>Bestellung</Table.HeaderCell>
              <Table.HeaderCell>Artikel</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {withdrawals.map((w) => (
              <Table.Row key={w.id}>
                <Table.Cell>
                  {new Date(w.created_at).toLocaleString("de-DE", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </Table.Cell>
                <Table.Cell>
                  <div>{w.name}</div>
                  <Text size="small" className="text-ui-fg-subtle">
                    {w.email}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {w.order_id ? (
                    <Link
                      to={`/orders/${w.order_id}`}
                      className="text-ui-fg-interactive"
                    >
                      #{w.order_number.replace(/^#/, "")}
                    </Link>
                  ) : (
                    <span title="Keine passende Bestellung gefunden">
                      {w.order_number} (?)
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell className="max-w-[240px] truncate">
                  {w.items || "Gesamte Bestellung"}
                </Table.Cell>
                <Table.Cell>
                  <Badge color={w.status === "processed" ? "green" : "orange"}>
                    {w.status === "processed" ? "Erledigt" : "Eingegangen"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={isPending}
                    onClick={() =>
                      mutate({
                        id: w.id,
                        status:
                          w.status === "processed" ? "received" : "processed",
                      })
                    }
                  >
                    {w.status === "processed" ? "Wieder öffnen" : "Erledigt"}
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Widerrufe",
  icon: ArrowUturnLeft,
})

export default WithdrawalsPage
