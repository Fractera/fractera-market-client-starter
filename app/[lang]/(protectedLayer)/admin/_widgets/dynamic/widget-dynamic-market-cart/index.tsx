// @local — the server entry of the widget «Корзина»: picks the words, renders the island.
import { CartView } from "./view.client"
import { cartWords } from "./words.i18n"

export function Widget({ lang }: { lang: string }) {
  return <CartView lang={lang} words={cartWords(lang)} />
}
