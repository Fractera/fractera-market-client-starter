"use client"
// @local — the island «Корзина» (steps 3-1, 4-4): one table of the starters in the cart on the node's `table-tools` (the row search,
// the filters «Бесплатные» and «От Fractera», the price sort, pages), the total and «Получить» for a free cart under it. A click on a
// name opens the starter's card beside the table (`table-detail`: Resizable, a drawer on a phone) — the same layout as the
// recommendations (the architect, Telegram 1655). Step 6: one button — «Получить» (free) or «Оплатить» (priced) — under the consent,
// unchecked at the start; a priced cart becomes «Ждём оплату» (the payer's window is the core's), its lines locked until the check.
import { useEffect, useState } from "react"
import { useQueryParam } from "../../../_libs/deep-link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { EmptyState } from "@/components/ui/empty-state"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableHead, TableRow } from "@/components/ui/table"
import { TableDetail } from "@/components/table/table-detail.client"
import { TableTools } from "@/components/table/table-tools.client"
import { tableUi } from "@/sections/table.i18n"
import { StarterCard } from "../../../_components/starter-card.client"
import { byFractera, money, priceOrder, when, type CartData, type CartLine } from "../../../_libs/market"
import type { CartWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; cart: CartData }

export function CartView({
  lang,
  words,
  state = { kind: "loading" },
  onRemove,
  onClear,
  onGet,
  onCheck,
}: {
  lang: string
  words: CartWords
  state?: State
  onRemove?: (line: CartLine) => void
  onClear?: () => void
  onGet?: (consent: boolean) => void
  onCheck?: (order: string) => void
}) {
  if (state.kind === "loading") return <CartSkeleton label={words.loading} />
  if (state.kind === "unavailable") return <CartSkeleton label={words.unavailable} />
  if (state.cart.lines.length === 0) return <EmptyState data-block="shdna" title={words.empty} hint={words.emptyHint} />
  return <CartTable lang={lang} words={words} cart={state.cart} onRemove={onRemove} onClear={onClear} onGet={onGet} onCheck={onCheck} />
}

function CartTable({
  lang,
  words,
  cart,
  onRemove,
  onClear,
  onGet,
  onCheck,
}: {
  lang: string
  words: CartWords
  cart: CartData
  onRemove?: (line: CartLine) => void
  onClear?: () => void
  onGet?: (consent: boolean) => void
  onCheck?: (order: string) => void
}) {
  const { lines, total, awaiting, unpaid } = cart
  const [openId, setOpenId] = useState<string | null>(null)
  // The architect's rule, ticked by the person each time: unchecked at the start, the button waits for it (step 6).
  const [agreed, setAgreed] = useState(false)
  // Step 5: `?open=<slug>` opens that starter's card.
  const [wantOpen] = useQueryParam("open")
  useEffect(() => {
    if (wantOpen && lines.some((x) => x.starter === wantOpen)) setOpenId(wantOpen)
    // Once per link, not per refresh of the list
  }, [wantOpen])
  const chosen = lines.find((l) => l.starter === openId) ?? null
  const compact = chosen !== null
  const free = total.amount === 0
  const c = words.columns
  const authorOf = (l: CartLine) => l.about?.author ?? ""

  const table = (
    <div data-block="cncsd" className="flex flex-col gap-4">
      <TableTools
        columns={compact ? 3 : 6}
        words={tableUi(lang)}
        texts={lines.map((l) => `${l.name} ${authorOf(l)}`)}
        filters={[
          { label: words.onlyFree, match: lines.map((l) => !l.price.amount) },
          { label: words.onlyFractera, match: lines.map((l) => byFractera(authorOf(l))) },
        ]}
        sorts={[
          { label: words.priceUp, order: priceOrder(lines.map((l) => l.price), 1) },
          { label: words.priceDown, order: priceOrder(lines.map((l) => l.price), -1) },
        ]}
        head={
          <TableRow data-block="ct1ha">
            <TableHead className="w-12 text-right">{c.n}</TableHead>
            <TableHead>{c.starter}</TableHead>
            {!compact && <TableHead>{c.author}</TableHead>}
            <TableHead className="text-right">{c.price}</TableHead>
            {!compact && <TableHead>{c.added}</TableHead>}
            {!compact && <TableHead className="text-right">{c.actions}</TableHead>}
          </TableRow>
        }
        rows={lines.map((l, i) => (
          <TableRow data-block="ixi7l" key={l.starter} data-state={l.starter === openId ? "selected" : undefined}>
            <TableCell className="text-right tabular-nums text-muted-foreground">{i + 1}</TableCell>
            <TableCell className="min-w-48 whitespace-normal">
              <Button
                variant="link"
                aria-expanded={l.starter === openId}
                className="h-auto p-0 text-left font-semibold whitespace-normal"
                onClick={() => setOpenId(l.starter === openId ? null : l.starter)}
              >
                {l.name}
              </Button>
            </TableCell>
            {!compact && <TableCell className="text-muted-foreground">{authorOf(l) || "—"}</TableCell>}
            <TableCell className="text-right font-semibold tabular-nums text-foreground">{money(l.price, lang, words.free)}</TableCell>
            {!compact && <TableCell className="text-xs tabular-nums text-muted-foreground">{when(l.added, lang)}</TableCell>}
            {!compact && (
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" disabled={!onRemove || l.locked} onClick={() => onRemove?.(l)}>
                  {words.remove}
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      />

      {awaiting ? (
        <div data-block="ctaw1" className="flex flex-col gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4" data-cart-state="awaiting">
          <div data-block="ctaw2" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div data-block="ctaw3" className="flex flex-col gap-1">
              <span className="text-base font-semibold text-foreground">{words.awaiting}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {words.order} <span className="font-mono">{awaiting.order}</span> · {words.total} {money(awaiting.total, lang, words.free)}
              </span>
            </div>
            <Button variant="outline" disabled={!onCheck} onClick={() => onCheck?.(awaiting.order)}>
              {words.check}
            </Button>
          </div>
          <p data-block="ctaw4" className="text-xs text-pretty text-muted-foreground">{words.awaitingHint}</p>
        </div>
      ) : (
        <div data-block="kw7o6" className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4" data-cart-state="open">
          {unpaid && (
            <p data-block="ctun1" className="text-sm text-pretty text-foreground">
              {words.unpaid} <span className="font-mono text-xs text-muted-foreground">{unpaid.order}</span>
            </p>
          )}
          <div data-block="gmcku" className="flex items-baseline gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{words.total}</span>
            <span className="text-2xl font-semibold tabular-nums text-foreground">{money(total, lang, words.free)}</span>
          </div>
          <Field data-block="ctcs1" orientation="horizontal" className="items-start">
            <Checkbox id="cart-consent" checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
            <FieldLabel htmlFor="cart-consent" className="text-sm leading-snug font-normal text-pretty">
              {words.consent}
            </FieldLabel>
          </Field>
          <div data-block="z5neu" className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" disabled={!onClear} onClick={() => onClear?.()}>
              {words.clear}
            </Button>
            <Button size="lg" disabled={!onGet || !agreed} onClick={() => onGet?.(agreed)}>
              {free ? words.get : words.pay}
            </Button>
          </div>
        </div>
      )}
    </div>
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
            info={{ name: chosen.name, price: chosen.price, about: chosen.about }}
            state={<span className="text-xs tabular-nums text-muted-foreground">{words.added} {when(chosen.added, lang)}</span>}
            actions={
              <Button size="sm" variant="ghost" disabled={!onRemove || chosen.locked} onClick={() => onRemove?.(chosen)}>
                {words.remove}
              </Button>
            }
            onClose={() => setOpenId(null)}
          />
        )
      }
    />
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
