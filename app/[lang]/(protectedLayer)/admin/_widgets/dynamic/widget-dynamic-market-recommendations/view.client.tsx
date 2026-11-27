"use client"
// @local — the island «Рекомендованные элементы» (steps 4-1, 4-4): one table of every recommended starter on the node's `table-tools` —
// the store search in its top card, the filters «Бесплатные» and «От Fractera», the price sort, rows per page and pages; each row with
// its three decisions. A click on a name opens the starter's card beside the table (`table-detail`: Resizable, a drawer on a phone);
// while it is open the table keeps only №, the starter, the price and the state — the card carries the rest.
import { type ReactNode, useState } from "react"
import { TableDetail } from "@/components/table/table-detail.client"
import { StarterCard } from "../../../_components/starter-card.client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { TableTools } from "@/components/table/table-tools.client"
import { tableUi } from "@/sections/table.i18n"
import { byFractera, money, priceOrder, when, whyText, type RecommendationRow, type TaskGroup } from "../../../_libs/market"
import type { RecommendationsWords } from "./words.i18n"

export type Choice = "keep" | "delete" | "cart"
type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; groups: TaskGroup[] }

export function RecommendationsView({
  lang,
  words,
  search,
  state = { kind: "loading" },
  onChoice,
}: {
  lang: string
  words: RecommendationsWords
  /** The store search form, drawn in the top card of the table. */
  search?: ReactNode
  state?: State
  onChoice?: (row: RecommendationRow, choice: Choice) => void
}) {
  const rows = state.kind === "ready" ? state.groups.flatMap((g) => g.rows) : []

  if (state.kind !== "ready" || rows.length === 0) {
    return (
      <div data-block="rv1aa" className="flex flex-col gap-4">
        {search && <div data-block="rv2ab" className="rounded-lg border border-border bg-card p-3">{search}</div>}
        {state.kind === "ready" ? (
          <EmptyState data-block="octho" title={words.empty} hint={words.emptyHint} />
        ) : (
          <RecommendationsSkeleton label={state.kind === "loading" ? words.loading : words.unavailable} />
        )}
      </div>
    )
  }

  return <RecommendationsTable lang={lang} words={words} search={search} rows={rows} onChoice={onChoice} />
}

function RecommendationsTable({
  lang,
  words,
  search,
  rows,
  onChoice,
}: {
  lang: string
  words: RecommendationsWords
  search?: ReactNode
  rows: RecommendationRow[]
  onChoice?: (row: RecommendationRow, choice: Choice) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const chosen = rows.find((r) => r.id === openId) ?? null
  const compact = chosen !== null
  const c = words.columns

  const table = (
    <TableTools
      search={search}
      columns={compact ? 4 : 7}
      words={tableUi(lang)}
      texts={rows.map((r) => `${r.name} ${r.author ?? ""} ${r.task}`)}
      filters={[
        { label: words.onlyFree, match: rows.map((r) => !r.price.amount) },
        { label: words.onlyFractera, match: rows.map((r) => byFractera(r.author)) },
      ]}
      sorts={[
        { label: words.priceUp, order: priceOrder(rows.map((r) => r.price), 1) },
        { label: words.priceDown, order: priceOrder(rows.map((r) => r.price), -1) },
      ]}
      head={
        <TableRow data-block="rv3ac">
          <TableHead className="w-12 text-right">{c.n}</TableHead>
          <TableHead>{c.starter}</TableHead>
          {!compact && <TableHead>{c.author}</TableHead>}
          <TableHead className="text-right">{c.price}</TableHead>
          {!compact && <TableHead>{c.task}</TableHead>}
          <TableHead>{c.state}</TableHead>
          {!compact && <TableHead className="text-right">{c.actions}</TableHead>}
        </TableRow>
      }
      rows={rows.map((r, i) => (
        <Row
          key={r.id}
          n={i + 1}
          lang={lang}
          words={words}
          row={r}
          compact={compact}
          chosen={r.id === openId}
          onOpen={() => setOpenId(r.id === openId ? null : r.id)}
          onChoice={onChoice}
        />
      ))}
    />
  )

  return (
    <TableDetail
      table={table}
      open={chosen !== null}
      onClose={() => setOpenId(null)}
      title={chosen?.name ?? ""}
      detail={
        chosen && (
          <StarterCard
            lang={lang}
            info={{ name: chosen.name, about: chosen }}
            state={<RowState words={words} row={chosen} />}
            actions={<RowActions words={words} row={chosen} onChoice={onChoice} />}
            onClose={() => setOpenId(null)}
          />
        )
      }
    />
  )
}

function Row({
  n,
  lang,
  words,
  row,
  compact,
  chosen,
  onOpen,
  onChoice,
}: {
  n: number
  lang: string
  words: RecommendationsWords
  row: RecommendationRow
  compact: boolean
  chosen: boolean
  onOpen: () => void
  onChoice?: (row: RecommendationRow, choice: Choice) => void
}) {
  const why = whyText(row.why)
  return (
    <TableRow data-block="rv4ad" data-state={chosen ? "selected" : undefined} className="align-top">
      <TableCell className="text-right tabular-nums text-muted-foreground">{n}</TableCell>
      <TableCell className="min-w-56 max-w-sm whitespace-normal">
        <div data-block="rv5ae" className="flex flex-col gap-1">
          <div data-block="rv6af" className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="link"
              aria-expanded={chosen}
              className="h-auto p-0 text-left font-semibold whitespace-normal"
              onClick={onOpen}
            >
              {row.name}
            </Button>
            {row.simulated && <Badge data-block="a5p7r" variant="outline">{words.simulated}</Badge>}
          </div>
          {why && !compact && <p data-block="wva5a" className="line-clamp-2 text-xs text-pretty text-muted-foreground">{why}</p>}
        </div>
      </TableCell>
      {!compact && <TableCell className="text-muted-foreground">{row.author || words.noAuthor}</TableCell>}
      <TableCell className="text-right font-semibold tabular-nums text-foreground">{money(row.price, lang, words.free)}</TableCell>
      {!compact && (
        <TableCell className="min-w-48 max-w-xs whitespace-normal">
          <div data-block="rv7ag" className="flex flex-col gap-1">
            <span className="line-clamp-2 text-sm text-foreground">«{row.task}»</span>
            <span className="text-xs text-muted-foreground">
              {words.askedBy} <span className="font-mono">{row.element}</span> · {when(row.time, lang)}
            </span>
          </div>
        </TableCell>
      )}
      <TableCell>
        <div data-block="rv8ah" className="flex flex-col items-start gap-1">
          <RowState words={words} row={row} />
        </div>
      </TableCell>
      {!compact && (
        <TableCell>
          <div data-block="izlw2" className="flex justify-end gap-1">
            <RowActions words={words} row={row} onChoice={onChoice} />
          </div>
        </TableCell>
      )}
    </TableRow>
  )
}

function RowState({ words, row }: { words: RecommendationsWords; row: RecommendationRow }) {
  const inCart = row.status === "cart"
  return (
    <>
      <Badge data-block="rv9ai" variant={inCart ? "default" : row.status === "kept" ? "secondary" : "outline"}>
        {words.status[row.status]}
      </Badge>
      <span className="text-xs tabular-nums text-muted-foreground">
        {words.usefulness} {Math.round(row.usefulness * 100)}%{row.bought && <> · {words.bought}</>}
      </span>
    </>
  )
}

function RowActions({
  words,
  row,
  onChoice,
}: {
  words: RecommendationsWords
  row: RecommendationRow
  onChoice?: (row: RecommendationRow, choice: Choice) => void
}) {
  const inCart = row.status === "cart"
  const off = !onChoice
  return (
    <>
      <Button size="sm" variant="ghost" disabled={off || row.status === "kept"} onClick={() => onChoice?.(row, "keep")}>
        {words.keep}
      </Button>
      <Button size="sm" variant="ghost" disabled={off} onClick={() => onChoice?.(row, "delete")}>
        {words.delete}
      </Button>
      <Button size="sm" variant={inCart ? "secondary" : "default"} disabled={off || inCart || row.bought} onClick={() => onChoice?.(row, "cart")}>
        {inCart ? words.inCart : words.toCart}
      </Button>
    </>
  )
}

function RecommendationsSkeleton({ label }: { label: string }) {
  return (
    <div data-block="udsib" className="flex flex-col gap-3" aria-busy="true">
      <div data-block="ok59b" className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {Array.from({ length: 4 }, (_, i) => (
          <div data-block="o7s2c" key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-7 w-40" />
          </div>
        ))}
      </div>
      <p data-block="vnyj2" className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
