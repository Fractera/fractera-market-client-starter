"use client"
// @local — the island «Купленные» (steps 3-1, 4-3): buying and installing are not the same (the architect, Telegram 1651). Each row:
// «Куплен», the install state (not installed · installing · installed as <element> at its address · failed with the reason) and one
// button — «Установить» while it is not installed, «Установить ещё раз» only once it is. Nothing is shown as bought before the core
// says so (R-04). The data and the action come from its island (island.client.tsx); «loading» shows its own skeleton.
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { when, type Purchase } from "../../../_libs/market"
import type { PurchasesWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; purchases: Purchase[] }

const RUNNING = new Set(["running", "started", "installing"])
const INSTALLED = new Set(["installed", "done"])

export function PurchasesView({
  lang,
  words,
  state = { kind: "loading" },
  onInstall,
}: {
  lang: string
  words: PurchasesWords
  state?: State
  onInstall?: (p: Purchase) => void
}) {
  if (state.kind === "loading") return <PurchasesSkeleton label={words.loading} />
  if (state.kind === "unavailable") return <PurchasesSkeleton label={words.unavailable} />
  if (state.purchases.length === 0) return <EmptyState data-block="okmrb" title={words.empty} hint={words.emptyHint} />

  return (
    <ul data-block="iojyb" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {state.purchases.map((p) => {
        const st = p.install?.state ?? "none"
        const installed = INSTALLED.has(st)
        const running = RUNNING.has(st)
        const el = p.install?.element
        return (
          <li data-block="wg9rt" key={p.starter} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-6">
            <div data-block="h0k53" className="flex min-w-0 flex-1 flex-col gap-0.5">
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

            <div data-block="pst4c" className="flex min-w-0 flex-col gap-1 md:w-80">
              <div data-block="pst5b" className="flex flex-wrap items-center gap-1.5" data-install-state={st}>
                <Badge data-block="u3ug8" variant="outline">{words.bought}</Badge>
                <Badge data-block="glqt5" variant={installed ? "default" : st === "failed" ? "destructive" : "secondary"}>
                  {words.state[st] ?? st}
                </Badge>
              </div>
              {installed && el && (
                <span className="truncate text-xs text-muted-foreground">
                  {words.element} <span className="font-medium text-foreground">{el.id}</span>
                  {el.address && (
                    <>
                      {" · "}
                      <a
                        href={el.address}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({ variant: "link", className: "h-auto p-0 text-xs" })}
                      >
                        {el.address.replace(/^https?:\/\//, "")}
                      </a>
                    </>
                  )}
                </span>
              )}
              {!installed && p.install?.reason && (
                <span className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{p.install.reason}</span>
              )}
            </div>

            <Button
              size="sm"
              variant={installed ? "outline" : "default"}
              className="self-start md:w-44 md:self-center"
              disabled={!onInstall || running}
              onClick={() => onInstall?.(p)}
            >
              {running ? words.installing : installed ? words.reinstall : words.install}
            </Button>
          </li>
        )
      })}
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
