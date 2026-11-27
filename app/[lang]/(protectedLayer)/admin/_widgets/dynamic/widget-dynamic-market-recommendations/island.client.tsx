"use client"
// @local — the live part of «Рекомендации» (step 3-2, table 4-1): the architect's store search in the table's top card, the rows from the branch door, the three decisions.
// Every act goes to the door and the list is read again from it — the page never shows a state the server did not keep.
import { Search } from "lucide-react"
import { useCallback, useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { marketCall, type RecommendationRow, type TaskGroup } from "../../../_libs/market"
import { RecommendationsView, type Choice } from "./view.client"
import type { RecommendationsWords } from "./words.i18n"

type State = { kind: "loading" } | { kind: "unavailable" } | { kind: "ready"; groups: TaskGroup[] }

export function RecommendationsIsland({ lang, words }: { lang: string; words: RecommendationsWords }) {
  const [state, setState] = useState<State>({ kind: "loading" })
  const [task, setTask] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const a = await marketCall<{ tasks: TaskGroup[] }>(lang, { view: "recommendations" })
    setState(a.ok ? { kind: "ready", groups: a.body.tasks } : { kind: "unavailable" })
  }, [lang])

  useEffect(() => {
    void load()
  }, [load])

  async function onSearch(e: FormEvent) {
    e.preventDefault()
    const t = task.trim()
    if (!t || busy) return
    setBusy(true)
    const a = await marketCall<{ added: number }>(lang, { op: "search", task: t })
    setBusy(false)
    if (!a.ok) return void toast.error(`${words.failed} ${a.reason}`)
    toast.success(a.body.added ? `${words.found} ${a.body.added}` : words.nothingNew)
    setTask("")
    await load()
  }

  async function onChoice(row: RecommendationRow, action: Choice) {
    if (busy) return
    setBusy(true)
    const a = await marketCall(lang, { op: "choice", row: row.id, action })
    setBusy(false)
    if (!a.ok) toast.error(`${words.failed} ${a.reason}`)
    await load()
  }

  const search = (
    <form data-block="sx7qa" onSubmit={onSearch} role="search" aria-label={words.searchLabel}>
      <InputGroup data-block="sv2mc" className="h-10">
        <InputGroupAddon data-block="rk4sa">
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          value={task}
          onChange={(e) => setTask(e.target.value)}
          maxLength={500}
          placeholder={words.searchPlaceholder}
          aria-label={words.searchLabel}
          disabled={busy}
        />
        <InputGroupAddon data-block="pa8wd" align="inline-end">
          <InputGroupButton type="submit" variant="default" size="sm" disabled={busy || !task.trim()}>
            {busy && <Spinner data-icon="inline-start" />}
            {busy ? words.searching : words.searchButton}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )

  return (
    <div data-block="rk3fz">
      <RecommendationsView lang={lang} words={words} search={search} state={state} onChoice={busy ? undefined : onChoice} />
    </div>
  )
}
