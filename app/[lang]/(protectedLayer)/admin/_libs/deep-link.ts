// @local — the deep links of the three marketplace pages (step 5): `?open=<slug>` opens that starter's card, `?element=<id>` narrows
// «Рекомендованные элементы» to one element's rows — the links the Telegram remote («Пульт», a custom element's Mini App) sends.
// Read after hydration from the address itself: the page stays static, a robot and the first paint see every row.
import { useEffect, useState } from "react"

export function useQueryParam(name: string): [string | null, () => void] {
  const [value, setValue] = useState<string | null>(null)
  useEffect(() => {
    setValue(new URLSearchParams(window.location.search).get(name))
  }, [name])
  const clear = () => {
    setValue(null)
    const url = new URL(window.location.href)
    url.searchParams.delete(name)
    window.history.replaceState(window.history.state, "", url)
  }
  return [value, clear]
}
