// @local — the server entry of the widget «Корзина»: picks the words, renders the island.
import { CartIsland } from "./island.client"
import { cartWords } from "./words.i18n"

export function Widget({ lang }: { lang: string }) {
  return <CartIsland lang={lang} words={cartWords(lang)} />
}
