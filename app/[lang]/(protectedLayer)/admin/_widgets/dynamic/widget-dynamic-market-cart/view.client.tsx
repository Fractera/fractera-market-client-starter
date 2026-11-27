"use client"
// @local — the island «Корзина» (step 3-1, design): one line per starter, the total, «Получить» for a free cart. Payment of a paid
// starter is hidden (the plan of step 3): a paid total shows one honest line instead of a button. The data and the actions arrive in
// its island (island.client.tsx); while `state` is «loading» the view shows its own skeleton.
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { money, when, type CartData, type CartLine } from "../../../_libs/market"
import type { CartWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; cart: CartData }

export function CartView({
  lang,
  words,
  state = { kind: "loading" },
  onRemove,
  onClear,
  onGet,
}: {
  lang: string
  words: CartWords
  state?: State
  onRemove?: (line: CartLine) => void
  onClear?: () => void
  onGet?: () => void
}) {
  if (state.kind === "loading") return <CartSkeleton label={words.loading} />
  if (state.kind === "unavailable") return <CartSkeleton label={words.unavailable} />
  const { lines, total } = state.cart
  if (lines.length === 0) return <EmptyState data-block="shdna" title={words.empty} hint={words.emptyHint} />
  const free = total.amount === 0

  return (
    <div data-block="cncsd" className="overflow-hidden rounded-xl border border-border bg-card">
      <ul data-block="sfl1o" className="divide-y divide-border">
        {lines.map((l) => (
          <li data-block="ixi7l" key={l.starter} className="flex items-center justify-between gap-4 p-4">
            <div data-block="leaib" className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-base font-semibold text-foreground">{l.name}</span>
              <span className="text-xs text-muted-foreground">
                {words.added} {when(l.added, lang)}
              </span>
            </div>
            <div data-block="risja" className="flex shrink-0 items-center gap-3">
              <span className="text-base font-semibold tabular-nums text-foreground">{money(l.price, lang, words.free)}</span>
              <Button size="sm" variant="ghost" disabled={!onRemove} onClick={() => onRemove?.(l)}>
                {words.remove}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Separator />
      <footer data-block="kw7o6" className="flex flex-col gap-4 bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div data-block="gmcku" className="flex items-baseline gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{words.total}</span>
          <span className="text-2xl font-semibold tabular-nums text-foreground">{money(total, lang, words.free)}</span>
        </div>
        <div data-block="z5neu" className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" disabled={!onClear} onClick={() => onClear?.()}>
            {words.clear}
          </Button>
          {free ? (
            <Button size="lg" disabled={!onGet} onClick={() => onGet?.()}>
              {words.get}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">{words.paidClosed}</span>
          )}
        </div>
      </footer>
      {free && <p data-block="cq4nt" className="bg-muted/40 px-4 pb-4 text-xs text-pretty text-muted-foreground">{words.consent}</p>}
    </div>
  )
}

function CartSkeleton({ label }: { label: string }) {
  return (
    <div data-block="aseit" className="flex flex-col gap-3" aria-busy="true">
      <div data-block="hyqwb" className="overflow-hidden rounded-xl border border-border bg-card">
        <div data-block="wyl2o" className="divide-y divide-border">
          {[0, 1, 2].map((i) => (
            <div data-block="bd1m5" key={i} className="flex items-center justify-between gap-4 p-4">
              <div data-block="fx3dd" className="flex flex-col gap-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-7 w-32" />
            </div>
          ))}
        </div>
        <Separator />
        <div data-block="gpbm4" className="flex items-center justify-between gap-4 bg-muted/40 p-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
      <p data-block="k2t70" className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
