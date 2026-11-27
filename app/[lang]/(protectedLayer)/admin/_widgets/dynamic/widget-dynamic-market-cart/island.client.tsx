"use client"
// @local — the live part of «Корзина» (steps 3-3, 3-4b): the lines from the branch door, remove, clear and «Получить» for a free
// cart. «Получено» is said only when the door answers `paid` from the core (R-04); a paid cart never reaches the core from here.
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
    else if (what.op === "get") {
      if (a.body.state === "paid") toast.success(words.gotDone, { action: { label: words.toPurchases, onClick: () => router.push(`/${lang}/admin/purchases`) } })
      else toast.message(`${words.pending} ${a.body.state ?? ""}`)
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
      onGet={busy ? undefined : () => act({ op: "get" })}
    />
  )
}
