"use client"
// @local — the island «Рекомендации» (step 3-1, design): the starters grouped under the task that asked for them, each row with
// its source, price and the three decisions. The data and the actions arrive in 3-2 (main pass): until then `state` is «loading»
// and the island shows its own skeleton — the same shape the answer will fill.
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Eyebrow, H3 } from "@/components/ui/typography"
import { money, when, whyText, type RecommendationRow, type TaskGroup } from "../../../_libs/market"
import type { RecommendationsWords } from "./words.i18n"

export type Choice = "keep" | "delete" | "cart"
type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; groups: TaskGroup[] }

export function RecommendationsView({
  lang,
  words,
  state = { kind: "loading" },
  onChoice,
}: {
  lang: string
  words: RecommendationsWords
  state?: State
  onChoice?: (row: RecommendationRow, choice: Choice) => void
}) {
  if (state.kind === "loading") return <RecommendationsSkeleton label={words.loading} />
  if (state.kind === "unavailable") return <RecommendationsSkeleton label={words.unavailable} />
  if (state.groups.length === 0) return <EmptyState data-block="octho" title={words.empty} hint={words.emptyHint} />

  return (
    <div data-block="tr9bm" className="flex flex-col gap-10">
      {state.groups.map((g) => (
        <section data-block="sqj86" key={g.task} className="flex flex-col gap-3">
          <TaskHead words={words} group={g} />
          <div data-block="hr1u1" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {g.rows.map((r) => (
              <Row key={r.id} lang={lang} words={words} row={r} onChoice={onChoice} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// The task is the heading of its group, in the words the element used: the architect decides for a task, not for a list.
function TaskHead({ words, group }: { words: RecommendationsWords; group: TaskGroup }) {
  const element = group.rows[0]?.element
  return (
    <div data-block="qz4nh" className="flex flex-col gap-1">
      <Eyebrow data-block="xb3ed">
        {words.task} · {group.rows.length} {words.starters}
      </Eyebrow>
      <div data-block="qchv7" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <H3 data-block="ojc9l" variant="content" className="text-pretty">«{group.task}»</H3>
        {element && (
          <span className="text-sm text-muted-foreground">
            {words.askedBy} <Badge data-block="ckyj6" variant="outline" className="font-mono">{element}</Badge>
          </span>
        )}
      </div>
    </div>
  )
}

function Row({
  lang,
  words,
  row,
  onChoice,
}: {
  lang: string
  words: RecommendationsWords
  row: RecommendationRow
  onChoice?: (row: RecommendationRow, choice: Choice) => void
}) {
  const why = whyText(row.why)
  const inCart = row.status === "cart"
  const off = !onChoice
  return (
    <article data-block="ypux8" className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div data-block="llkwo" className="flex min-w-0 flex-col gap-1.5">
        <div data-block="an5sc" className="flex flex-wrap items-center gap-2">
          {row.page ? (
            <a
              href={row.page}
              target="_blank"
              rel="noreferrer"
              aria-label={`${words.open}: ${row.name}`}
              className={buttonVariants({ variant: "link", className: "h-auto p-0 text-base font-semibold" })}
            >
              {row.name}
            </a>
          ) : (
            <span className="text-base font-semibold text-foreground">{row.name}</span>
          )}
          <Badge data-block="ao4lf" variant="secondary">{row.source}</Badge>
          {row.simulated && <Badge data-block="a5p7r" variant="outline">{words.simulated}</Badge>}
        </div>
        {why && <p data-block="wva5a" className="text-sm text-pretty text-muted-foreground">{why}</p>}
        <p data-block="b25dh" className="text-xs tabular-nums text-muted-foreground">
          {words.status[row.status]} · {words.usefulness} {Math.round(row.usefulness * 100)}% · {when(row.time, lang)}
          {row.bought && <> · {words.bought}</>}
        </p>
      </div>
      <div data-block="z2swv" className="flex shrink-0 flex-col gap-3 sm:items-end">
        <span className="text-lg font-semibold tabular-nums text-foreground">{money(row.price, lang, words.free)}</span>
        <div data-block="izlw2" className="flex flex-wrap gap-2">
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
      </div>
    </article>
  )
}

function RecommendationsSkeleton({ label }: { label: string }) {
  return (
    <div data-block="udsib" className="flex flex-col gap-10" aria-busy="true">
      {[3, 2].map((n, g) => (
        <section data-block="m0qpu" key={g} className="flex flex-col gap-3">
          <div data-block="n3zeq" className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-3/4 max-w-md" />
          </div>
          <div data-block="ok59b" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {Array.from({ length: n }, (_, i) => (
              <div data-block="o7s2c" key={i} className="flex flex-col gap-4 p-4 sm:flex-row sm:justify-between">
                <div data-block="pz7qr" className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-72 max-w-full" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div data-block="mno02" className="flex flex-col gap-3 sm:items-end">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-7 w-56" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      <p data-block="vnyj2" className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
