"use client"
// @part table-tools — the full table set: a control card on top (search, toggles, filters, sort, reset), the table, rows per page and pages.

import { Search } from "lucide-react"
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Small } from "@/components/ui/typography"
import type { TableUi } from "@/sections/table.i18n"

// Taken from the core's «table-tools» v1.0.1 and made this element's own (node step 735, `npm run tool:own`), v1.1.0:
// - every control is shadcn (the core's copy carried raw inputs and buttons);
// - `search` — the caller's own search in the top card instead of the row search (the marketplace: the store search, never a filter);
// - `filters` — narrowing checkboxes, off at the start: a row stays only if every checked filter admits it;
// - `sorts` — orders of the rows; one at a time, pressed again → back to the rows' own order.
// `toggles` keep the core's meaning: all checked at the start, a row shows if any checked toggle admits it.
// Before the island wakes (no JavaScript, a robot) every row shows; paging starts after hydration.

const PER_PAGE = [10, 25, 50, 100] as const

type Mark = { label: string; match: boolean[] }

export function TableTools({
  caption,
  head,
  rows,
  texts,
  columns,
  words,
  toggles,
  search,
  filters,
  sorts,
}: {
  caption?: ReactNode
  head: ReactNode
  /** Ready `<TableRow>` rows drawn by the caller. */
  rows: ReactNode[]
  /** The text of each row without markup — the row search goes over it (unused when `search` is given). */
  texts: string[]
  columns: number
  words: TableUi
  toggles?: Mark[]
  /** The caller's own search, drawn in the top card in place of the row search. */
  search?: ReactNode
  filters?: Mark[]
  /** `order` — the row indexes in the order of this sort. */
  sorts?: { label: string; order: number[] }[]
}) {
  const [ready, setReady] = useState(false)
  const [on, setOn] = useState<boolean[]>(() => (toggles ?? []).map(() => true))
  const [narrow, setNarrow] = useState<boolean[]>(() => (filters ?? []).map(() => false))
  const [sort, setSort] = useState<number | null>(null)
  const [draft, setDraft] = useState("")
  const [q, setQ] = useState("")
  const [per, setPer] = useState<number>(PER_PAGE[0])
  const [page, setPage] = useState(1)

  useEffect(() => setReady(true), [])

  const matched = useMemo(() => {
    const needle = search ? "" : q.trim().toLowerCase()
    const kept = (i: number) =>
      (!toggles?.length || toggles.some((t, ti) => on[ti] && t.match[i])) &&
      (filters ?? []).every((f, fi) => !narrow[fi] || f.match[i]) &&
      (!needle || (texts[i] ?? "").toLowerCase().includes(needle))
    const order = sort !== null && sorts?.[sort] ? sorts[sort].order : rows.map((_, i) => i)
    return order.filter(kept)
  }, [q, rows, texts, toggles, on, filters, narrow, sorts, sort, search])

  const size = ready ? per : Math.max(1, matched.length)
  const pages = Math.max(1, Math.ceil(matched.length / size))
  const current = Math.min(page, pages)
  const visible = matched.slice((current - 1) * size, current * size)
  const from = matched.length === 0 ? 0 : (current - 1) * size + 1
  const to = (current - 1) * size + visible.length
  const atFirst = current <= 1
  const atLast = current >= pages
  const marks = [...(toggles ?? []).map((t, i) => ({ t, i, kind: "toggle" as const })), ...(filters ?? []).map((t, i) => ({ t, i, kind: "filter" as const }))]

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setQ(draft)
    setPage(1)
  }

  function reset() {
    setDraft("")
    setQ("")
    setPer(PER_PAGE[0])
    setPage(1)
    setOn((toggles ?? []).map(() => true))
    setNarrow((filters ?? []).map(() => false))
    setSort(null)
  }

  return (
    <div data-block="tt1ka" className="flex flex-col gap-4" data-table-tools={matched.length}>
      {/* ── the control card ── */}
      <div data-block="tt2kb" className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
        {search ?? (
          <form data-block="tt3kc" onSubmit={onSubmit} role="search">
            <InputGroup data-block="tt4kd">
              <InputGroupAddon data-block="tt5ke">
                <Search aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                aria-label={words.search}
                data-table-search
                onChange={(e) => setDraft(e.target.value)}
                placeholder={words.search}
                type="search"
                value={draft}
              />
              <InputGroupAddon data-block="tt6kf" align="inline-end">
                <InputGroupButton type="submit" variant="secondary" size="sm">
                  {words.searchDo}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        )}

        <div data-block="tt7kg" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {marks.map(({ t, i, kind }) => {
            const id = `table-${kind}-${i}`
            const checked = kind === "toggle" ? (on[i] ?? true) : (narrow[i] ?? false)
            return (
              <div data-block="tt8kh" key={id} className="flex items-center gap-2" data-table-toggle={`${kind}-${i}`}>
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(v) => {
                    const set = kind === "toggle" ? setOn : setNarrow
                    set((prev) => prev.map((x, k) => (k === i ? Boolean(v) : x)))
                    setPage(1)
                  }}
                />
                <Label htmlFor={id} className="font-normal">
                  {t.label}
                </Label>
              </div>
            )
          })}

          {sorts?.length ? (
            <ButtonGroup data-block="tt9ki" aria-label={words.sort} data-table-sort={sort ?? "none"}>
              {sorts.map((s, si) => (
                <Button
                  key={s.label}
                  size="sm"
                  variant={sort === si ? "secondary" : "outline"}
                  aria-pressed={sort === si}
                  onClick={() => {
                    setSort((prev) => (prev === si ? null : si))
                    setPage(1)
                  }}
                >
                  {s.label}
                </Button>
              ))}
            </ButtonGroup>
          ) : null}

          <Button size="sm" variant="link" className="ml-auto px-0 text-muted-foreground" onClick={reset}>
            {words.reset}
          </Button>
        </div>
      </div>

      {/* ── the table ── */}
      <div data-block="ttakj" className="overflow-hidden rounded-lg border border-border bg-card">
        {caption && (
          <div data-block="ttbkk" className="border-b border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground">
            {caption}
          </div>
        )}
        <Table data-block="ttckl">
          <TableHeader data-block="ttdkm" className="bg-muted/40">{head}</TableHeader>
          <TableBody data-block="ttekn">
            {visible.length === 0 ? (
              <TableRow data-block="ttfko">
                <TableCell colSpan={columns} className="py-6 text-center">
                  <Small data-block="jiuwe" className="text-muted-foreground" data-table-empty>
                    {words.empty}
                  </Small>
                </TableCell>
              </TableRow>
            ) : (
              visible.map((i) => rows[i])
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── pages ── */}
      <div data-block="ttgkp" className="flex flex-wrap items-center justify-between gap-3">
        <Small data-block="gl29k" className="tabular-nums text-muted-foreground" data-table-shown>
          {words.shown.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(matched.length))}
        </Small>

        <div data-block="tthkq" className="flex items-center gap-2">
          <Small data-block="kt323" className="text-muted-foreground">{words.perPage}</Small>
          <ButtonGroup data-block="ttikr" data-filter="per">
            {PER_PAGE.map((n) => (
              <Button
                key={n}
                size="sm"
                variant={n === per ? "secondary" : "outline"}
                aria-pressed={n === per}
                className="tabular-nums"
                onClick={() => {
                  setPer(n)
                  setPage(1)
                }}
              >
                {n}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        <Pagination className="mx-0 w-full sm:w-auto">
          <PaginationContent className="w-full justify-between sm:w-auto sm:justify-start" data-table-pager={`${current}/${pages}`}>
            <PaginationItem>
              <Button size="sm" variant="outline" aria-label={words.first} disabled={atFirst} onClick={() => setPage(1)}>
                ««
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button size="sm" variant="outline" disabled={atFirst} onClick={() => setPage(Math.max(1, current - 1))}>
                {words.prev}
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Small data-block="a9cpi" className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">
                {words.page.replace("{n}", String(current)).replace("{of}", String(pages))}
              </Small>
            </PaginationItem>
            <PaginationItem>
              <Button size="sm" variant="outline" disabled={atLast} onClick={() => setPage(Math.min(pages, current + 1))}>
                {words.next}
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button size="sm" variant="outline" aria-label={words.last} disabled={atLast} onClick={() => setPage(pages)}>
                »»
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
