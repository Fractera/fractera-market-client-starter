"use client"
// @local — the live part of «Купленные» (steps 3-4, 3-4b, 4-3): what the core confirmed as paid, its install state, «Установить» or «Установить ещё раз»
// on the same order with no new payment (R-05).
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { marketCall, type Purchase } from "../../../_libs/market"
import { PurchasesView } from "./view.client"
import type { PurchasesWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; purchases: Purchase[] }

export function PurchasesIsland({ lang, words }: { lang: string; words: PurchasesWords }) {
  const [state, setState] = useState<State>({ kind: "loading" })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const a = await marketCall<{ purchases: Purchase[] }>(lang, { view: "purchases" })
    setState(a.ok ? { kind: "ready", purchases: a.body.purchases } : { kind: "unavailable" })
  }, [lang])

  useEffect(() => {
    void load()
  }, [load])

  async function onInstall(p: Purchase) {
    setBusy(true)
    const a = await marketCall(lang, { op: "reinstall", starter: p.starter })
    setBusy(false)
    if (a.ok) toast.success(words.installStarted)
    else toast.error(`${words.failed} ${a.reason}`)
    await load()
  }

  return <PurchasesView lang={lang} words={words} state={state} onInstall={busy ? undefined : onInstall} />
}
