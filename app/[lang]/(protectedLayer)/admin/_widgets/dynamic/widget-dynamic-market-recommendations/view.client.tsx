"use client"
// @local — the island «Рекомендации» (step 4-1, design): one table of every recommended starter on the node's `table-tools` — the store
// search in its top card, the filters «Бесплатные» and «От Fractera», the price sort, rows per page and pages; each row with its three decisions.
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { TableTools } from "@/components/table/table-tools.client"
import { tableUi } from "@/sections/table.i18n"
import { money, when, whyText, type RecommendationRow, type TaskGroup } from "../../../_libs/market"
import type { RecommendationsWords } from "./words.i18n"

export type Choice = "keep" | "delete" | "cart"
type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; groups: TaskGroup[] }

const isFractera = (r: RecommendationRow) => (r.author ?? "").trim().toLowerCase() === "fractera"

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

  // Equal prices keep the list's own order in both directions (step 4-2: «Цена ↓» swapped two free rows).
  const priceOrder = (dir: 1 | -1) => rows.map((_, i) => i).sort((a, b) => dir * (rows[a].price.amount - rows[b].price.amount) || a - b)
  const c = words.columns

  return (
    <TableTools
      search={search}
      columns={7}
      words={tableUi(lang)}
      texts={rows.map((r) => `${r.name} ${r.author ?? ""} ${r.task}`)}
      filters={[
        { label: words.onlyFree, match: rows.map((r) => !r.price.amount) },
        { label: words.onlyFractera, match: rows.map(isFractera) },
      ]}
      sorts={[
        { label: words.priceUp, order: priceOrder(1) },
        { label: words.priceDown, order: priceOrder(-1) },
      ]}
      head={
        <TableRow data-block="rv3ac">
          <TableHead className="w-12 text-right">{c.n}</TableHead>
          <TableHead>{c.starter}</TableHead>
          <TableHead>{c.author}</TableHead>
          <TableHead className="text-right">{c.price}</TableHead>
          <TableHead>{c.task}</TableHead>
          <TableHead>{c.state}</TableHead>
          <TableHead className="text-right">{c.actions}</TableHead>
        </TableRow>
      }
      rows={rows.map((r, i) => (
        <Row key={r.id} n={i + 1} lang={lang} words={words} row={r} onChoice={onChoice} />
      ))}
    />
  )
}

function Row({
  n,
  lang,
  words,
  row,
  onChoice,
}: {
  n: number
  lang: string
  words: RecommendationsWords
  row: RecommendationRow
  onChoice?: (row: RecommendationRow, choice: Choice) => void
}) {
  const why = whyText(row.why)
  const inCart = row.status === "cart"
  const off = !onChoice
  return (
    <TableRow data-block="rv4ad" className="align-top">
      <TableCell className="text-right tabular-nums text-muted-foreground">{n}</TableCell>
      <TableCell className="min-w-56 max-w-sm whitespace-normal">
        <div data-block="rv5ae" className="flex flex-col gap-1">
          <div data-block="rv6af" className="flex flex-wrap items-center gap-1.5">
            {row.page ? (
              <a
                href={row.page}
                target="_blank"
                rel="noreferrer"
                aria-label={`${words.open}: ${row.name}`}
                className={buttonVariants({ variant: "link", className: "h-auto p-0 font-semibold" })}
              >
                {row.name}
              </a>
            ) : (
              <span className="font-semibold text-foreground">{row.name}</span>
            )}
            {row.simulated && <Badge data-block="a5p7r" variant="outline">{words.simulated}</Badge>}
          </div>
          {why && <p data-block="wva5a" className="line-clamp-2 text-xs text-pretty text-muted-foreground">{why}</p>}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{row.author || words.noAuthor}</TableCell>
      <TableCell className="text-right font-semibold tabular-nums text-foreground">{money(row.price, lang, words.free)}</TableCell>
      <TableCell className="min-w-48 max-w-xs whitespace-normal">
        <div data-block="rv7ag" className="flex flex-col gap-1">
          <span className="line-clamp-2 text-sm text-foreground">«{row.task}»</span>
          <span className="text-xs text-muted-foreground">
            {words.askedBy} <span className="font-mono">{row.element}</span> · {when(row.time, lang)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div data-block="rv8ah" className="flex flex-col items-start gap-1">
          <Badge data-block="rv9ai" variant={inCart ? "default" : row.status === "kept" ? "secondary" : "outline"}>
            {words.status[row.status]}
          </Badge>
          <span className="text-xs tabular-nums text-muted-foreground">
            {words.usefulness} {Math.round(row.usefulness * 100)}%{row.bought && <> · {words.bought}</>}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div data-block="izlw2" className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" disabled={off || row.status === "kept"} onClick={() => onChoice?.(row, "keep")}>
            {words.keep}
          </Button>
          <Button size="sm" variant="ghost" disabled={off} onClick={() => onChoice?.(row, "delete")}>
            {words.delete}
          </Button>
          <Button size="sm" variant={inCart ? "secondary" : "default"} disabled={off || inCart || row.bought} onClick={() => onChoice?.(row, "cart")}>
            {inCart ? words.inCart : words.toCart}
          </Button>
        </div>
      </TableCell>
    </TableRow>
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
