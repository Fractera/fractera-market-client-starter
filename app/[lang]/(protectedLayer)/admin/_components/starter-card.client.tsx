"use client"
// @local — the card of one starter, shared by the three marketplace pages of this branch (step 4-4): everything the store gave —
// name, author, source, price, version once bought, what it can do, why it fits and how useful, the task that asked for it — with the
// page's own state and actions passed in, and a close. It stands in the right half of `table-detail` or in its phone drawer.
import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Small } from "@/components/ui/typography"
import { money, when, whyText, type Money, type RecommendationRow } from "../_libs/market"
import { starterCardWords } from "./starter-card.i18n"

export type StarterInfo = {
  name: string
  price?: Money
  author?: string
  page?: string | null
  version?: string
  /** What the store said of it — the latest recommendation row; absent for a starter bought before any recommendation. */
  about?: RecommendationRow | null
}

export function StarterCard({
  lang,
  info,
  state,
  actions,
  onClose,
}: {
  lang: string
  info: StarterInfo
  /** The page's own state of this starter (badges, a line). */
  state?: ReactNode
  /** The page's own buttons for this starter. */
  actions?: ReactNode
  onClose: () => void
}) {
  const w = starterCardWords(lang)
  const a = info.about ?? null
  const price = info.price ?? a?.price
  const author = info.author || a?.author || ""
  const page = info.page ?? a?.page ?? null
  const why = a ? whyText(a.why) : ""
  const can = a?.description?.trim() ?? ""

  return (
    <Card data-block="scd1a" className="gap-5">
      <CardHeader data-block="scd2b">
        <CardTitle className="text-xl leading-tight font-semibold text-balance">{info.name}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            {w.author} <span className="font-medium text-foreground">{author || "—"}</span>
          </span>
          {a?.source && <span>· {w.source} {a.source}</span>}
          {info.version && <span className="tabular-nums">· {w.version} {info.version}</span>}
          {a?.simulated && <Badge data-block="v347s" variant="outline">{w.simulated}</Badge>}
        </CardDescription>
        <CardAction>
          <Button size="icon" variant="ghost" aria-label={w.close} onClick={onClose}>
            <X />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent data-block="scd3c" className="flex flex-col gap-5">
        <div data-block="scd4d" className="flex flex-wrap items-end justify-between gap-3">
          <div data-block="scd5e" className="flex flex-col gap-1">
            <Small data-block="lr52u">{w.price}</Small>
            <span className="text-2xl font-semibold tabular-nums text-foreground">{price ? money(price, lang, w.free) : "—"}</span>
          </div>
          {state && <div data-block="scd6f" className="flex flex-col items-end gap-1">{state}</div>}
        </div>

        <Separator />

        <dl data-block="scd7g" className="flex flex-col gap-4">
          <div data-block="scd8h" className="flex flex-col gap-1">
            <dt data-block="vmziy" className="text-xs font-medium text-muted-foreground">{w.can}</dt>
            <dd data-block="txh46" className="text-sm text-pretty text-foreground">{can || w.unknown}</dd>
          </div>
          {why && (
            <div data-block="scd9i" className="flex flex-col gap-1">
              <dt data-block="ehaso" className="text-xs font-medium text-muted-foreground">{w.why}</dt>
              <dd data-block="z80d0" className="text-sm text-pretty text-foreground">
                {why}
                <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                  {w.usefulness} {Math.round((a?.usefulness ?? 0) * 100)}%
                </span>
              </dd>
            </div>
          )}
          {a?.task && (
            <div data-block="scdaj" className="flex flex-col gap-1">
              <dt data-block="ipd1p" className="text-xs font-medium text-muted-foreground">{w.task}</dt>
              <dd data-block="p9su1" className="flex flex-col gap-0.5 text-sm text-foreground">
                <span className="text-pretty">«{a.task}»</span>
                <span className="text-xs text-muted-foreground">
                  {w.askedBy} <span className="font-mono">{a.element}</span> · {when(a.time, lang)}
                </span>
              </dd>
            </div>
          )}
        </dl>
      </CardContent>

      <CardFooter data-block="scdbk" className="flex flex-wrap items-center justify-between gap-2">
        {page ? (
          <a href={page} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "link", className: "h-auto p-0" })}>
            {w.storePage} ↗
          </a>
        ) : (
          <span />
        )}
        {actions && <div data-block="scdcl" className="flex flex-wrap items-center gap-1">{actions}</div>}
      </CardFooter>
    </Card>
  )
}
