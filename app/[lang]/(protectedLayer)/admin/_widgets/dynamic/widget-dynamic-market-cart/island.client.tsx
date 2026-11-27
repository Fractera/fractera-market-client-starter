"use client"
// @local — the live part of «Корзина» (steps 3-3, 3-4b, 6): the lines from the branch door, remove, clear, «Получить» / «Оплатить»
// with the consent, «Проверить оплату» for a waiting order. «Получено» and «Оплачено» only when the door answers `paid` from the core (R-04).
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { marketCall, type CartData, type CartLine } from "../../../_libs/market"
import { CartView } from "./view.client"
import type { CartWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; cart: CartData }

export function CartIsland({ lang, words }: { lang: string; words: CartWords }) {
  const [state, setState] = useState<State>({ kind: "loading" })
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    const a = await marketCall<CartData>(lang, { view: "cart" })
    setState(a.ok ? { kind: "ready", cart: a.body } : { kind: "unavailable" })
  }, [lang])

  useEffect(() => {
    void load()
  }, [load])

  async function act(what: { op: string; [k: string]: unknown }) {
    setBusy(true)
    const a = await marketCall<{ state?: string; order?: string }>(lang, what)
    setBusy(false)
    if (!a.ok) toast.error(`${words.failed} ${a.reason}`)
    else if (what.op === "get" || what.op === "check") {
      // «Получено» / «Оплачено» only on the core's word that the order is paid (R-04).
      const s = a.body.state
      const toBought = { action: { label: words.toPurchases, onClick: () => router.push(`/${lang}/admin/purchases`) } }
      if (s === "paid") toast.success(what.op === "check" ? words.paidDone : words.gotDone, toBought)
      else if (s === "already-ordered") toast.success(words.alreadyBought, toBought)
      else if (s === "awaiting-payer") toast.message(words.awaiting)
      else if (s === "unpaid") toast.message(words.stillUnpaid)
      else toast.message(`${words.pending} ${s ?? ""}`)
    }
    await load()
  }

  return (
    <CartView
      lang={lang}
      words={words}
      state={state}
      onRemove={busy ? undefined : (l: CartLine) => act({ op: "cart", action: "remove", starter: l.starter })}
      onClear={busy ? undefined : () => act({ op: "cart", action: "clear" })}
      onGet={busy ? undefined : (consent: boolean) => act({ op: "get", consent })}
      onCheck={busy ? undefined : (order: string) => act({ op: "check", order })}
    />
  )
}
