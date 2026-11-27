"use client"
// @local — the island «Купленные» (steps 3-1, 4-3, 4-4): buying and installing are not the same (the architect, Telegram 1651). One
// table on the node's `table-tools` (the row search, the filters «Не установленные» and «От Fractera», pages); each row: «Куплен», the
// install state (not installed · installing · installed as <element> at its address · failed, in this page's own words) and one button —
// «Установить» while it is not installed, «Установить ещё раз» only once it is. A click on a name opens the starter's card beside the
// table (`table-detail`) — the same layout as the recommendations and the cart (Telegram 1655). Nothing is shown as bought before the
// core says so (R-04). The data and the action come from its island (island.client.tsx).
import { useEffect, useState } from "react"
import { useQueryParam } from "../../../_libs/deep-link"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { TableDetail } from "@/components/table/table-detail.client"
import { TableTools } from "@/components/table/table-tools.client"
import { tableUi } from "@/sections/table.i18n"
import { StarterCard } from "../../../_components/starter-card.client"
import { byFractera, when, type Purchase } from "../../../_libs/market"
import type { PurchasesWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; purchases: Purchase[] }

const RUNNING = new Set(["running", "started", "installing"])
const INSTALLED = new Set(["installed", "done"])
const stateOf = (p: Purchase) => p.install?.state ?? "none"

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
  return <PurchasesTable lang={lang} words={words} purchases={state.purchases} onInstall={onInstall} />
}

function PurchasesTable({
  lang,
  words,
  purchases,
  onInstall,
}: {
  lang: string
  words: PurchasesWords
  purchases: Purchase[]
  onInstall?: (p: Purchase) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  // Step 5: `?open=<slug>` opens that starter's card.
  const [wantOpen] = useQueryParam("open")
  useEffect(() => {
    if (wantOpen && purchases.some((x) => x.starter === wantOpen)) setOpenId(wantOpen)
    // Once per link, not per refresh of the list
  }, [wantOpen])
  const chosen = purchases.find((p) => p.starter === openId) ?? null
  const compact = chosen !== null
  const c = words.columns

  const table = (
    <TableTools
      columns={compact ? 3 : 7}
      words={tableUi(lang)}
      texts={purchases.map((p) => `${p.name} ${p.author} ${p.version}`)}
      filters={[
        { label: words.notInstalled, match: purchases.map((p) => !INSTALLED.has(stateOf(p))) },
        { label: words.onlyFractera, match: purchases.map((p) => byFractera(p.author)) },
      ]}
      head={
        <TableRow data-block="pt1ha">
          <TableHead className="w-12 text-right">{c.n}</TableHead>
          <TableHead>{c.starter}</TableHead>
          {!compact && <TableHead>{c.author}</TableHead>}
          {!compact && <TableHead>{c.version}</TableHead>}
          {!compact && <TableHead>{c.got}</TableHead>}
          <TableHead>{c.state}</TableHead>
          {!compact && <TableHead className="text-right">{c.actions}</TableHead>}
        </TableRow>
      }
      rows={purchases.map((p, i) => (
        <TableRow data-block="wg9rt" key={p.starter} data-state={p.starter === openId ? "selected" : undefined} className="align-top">
          <TableCell className="text-right tabular-nums text-muted-foreground">{i + 1}</TableCell>
          <TableCell className="min-w-48 whitespace-normal">
            <Button
              variant="link"
              aria-expanded={p.starter === openId}
              className="h-auto p-0 text-left font-semibold whitespace-normal"
              onClick={() => setOpenId(p.starter === openId ? null : p.starter)}
            >
              {p.name}
            </Button>
          </TableCell>
          {!compact && <TableCell className="text-muted-foreground">{p.author || "—"}</TableCell>}
          {!compact && <TableCell className="tabular-nums text-muted-foreground">{p.version || "—"}</TableCell>}
          {!compact && <TableCell className="text-xs tabular-nums text-muted-foreground">{when(p.time, lang)}</TableCell>}
          <TableCell className="max-w-80 whitespace-normal">
            <InstallState words={words} p={p} />
          </TableCell>
          {!compact && (
            <TableCell className="text-right">
              <InstallButton words={words} p={p} onInstall={onInstall} />
            </TableCell>
          )}
        </TableRow>
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
            info={{ name: chosen.name, author: chosen.author, page: chosen.page, version: chosen.version, about: chosen.about }}
            state={<InstallState words={words} p={chosen} />}
            actions={<InstallButton words={words} p={chosen} onInstall={onInstall} />}
            onClose={() => setOpenId(null)}
          />
        )
      }
    />
  )
}

function InstallState({ words, p }: { words: PurchasesWords; p: Purchase }) {
  const st = stateOf(p)
  const installed = INSTALLED.has(st)
  const el = p.install?.element
  return (
    <div data-block="pst4c" className="flex min-w-0 flex-col gap-1">
      <div data-block="pst5b" className="flex flex-wrap items-center gap-1.5" data-install-state={st}>
        <Badge data-block="poobs" variant="outline">{words.bought}</Badge>
        <Badge data-block="tp9hm" variant={installed ? "default" : st === "failed" ? "destructive" : "secondary"}>{words.state[st] ?? st}</Badge>
      </div>
      {installed && el && (
        <span className="truncate text-xs text-muted-foreground">
          {words.element} <span className="font-medium text-foreground">{el.id}</span>
          {el.address && (
            <>
              {" · "}
              <a href={el.address} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "link", className: "h-auto p-0 text-xs" })}>
                {el.address.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </span>
      )}
      {/* The core's own reason is English and technical — never shown raw; the person reads this page's words (the core, 2026-11-27). */}
      {!installed && words.hint[st] && <span className="text-xs text-pretty text-muted-foreground">{words.hint[st]}</span>}
    </div>
  )
}

function InstallButton({ words, p, onInstall }: { words: PurchasesWords; p: Purchase; onInstall?: (p: Purchase) => void }) {
  const st = stateOf(p)
  const installed = INSTALLED.has(st)
  const running = RUNNING.has(st)
  return (
    <Button size="sm" variant={installed ? "outline" : "default"} disabled={!onInstall || running} onClick={() => onInstall?.(p)}>
      {running ? words.installing : installed ? words.reinstall : words.install}
    </Button>
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
