"use client"
// @local — the island «Покупки» (step 3-1, design): what the core confirmed as received, its version and author, «Установить ещё
// раз» with no new payment. An honest empty state: nothing is shown as bought before the core says so (R-04). The data and the
// action arrive in 3-4 / 4b (main pass); until then `state` is «loading» and the island shows its own skeleton.
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { when, type Purchase } from "../../../_libs/market"
import type { PurchasesWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; purchases: Purchase[] }

export function PurchasesView({
  lang,
  words,
  state = { kind: "loading" },
  onReinstall,
}: {
  lang: string
  words: PurchasesWords
  state?: State
  onReinstall?: (p: Purchase) => void
}) {
  if (state.kind === "loading") return <PurchasesSkeleton label={words.loading} />
  if (state.kind === "unavailable") return <PurchasesSkeleton label={words.unavailable} />
  if (state.purchases.length === 0) return <EmptyState data-block="okmrb" title={words.empty} hint={words.emptyHint} />

  return (
    <ul data-block="iojyb" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {state.purchases.map((p) => (
        <li data-block="wg9rt" key={p.starter} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div data-block="h0k53" className="flex min-w-0 flex-col gap-0.5">
            {p.page ? (
              <a
                href={p.page}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "link", className: "h-auto justify-start p-0 text-base font-semibold" })}
              >
                {p.name}
              </a>
            ) : (
              <span className="text-base font-semibold text-foreground">{p.name}</span>
            )}
            <span className="text-xs tabular-nums text-muted-foreground">
              {words.version} {p.version} · {words.author} {p.author} · {words.got} {when(p.time, lang)}
            </span>
          </div>
          <Button size="sm" variant="outline" disabled={!onReinstall} onClick={() => onReinstall?.(p)}>
            {words.reinstall}
          </Button>
        </li>
      ))}
    </ul>
  )
}

function PurchasesSkeleton({ label }: { label: string }) {
  return (
    <div data-block="g0230" className="flex flex-col gap-3" aria-busy="true">
      <div data-block="b20vz" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {[0, 1].map((i) => (
          <div data-block="hdvxb" key={i} className="flex items-center justify-between gap-4 p-4">
            <div data-block="gyb76" className="flex flex-col gap-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <Skeleton className="h-7 w-36" />
          </div>
        ))}
      </div>
      <p data-block="twyih" className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
