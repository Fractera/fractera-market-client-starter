// @local — the server entry of the widget «Покупки»: picks the words, renders the island.
import { PurchasesView } from "./view.client"
import { purchasesWords } from "./words.i18n"

export function Widget({ lang }: { lang: string }) {
  return <PurchasesView lang={lang} words={purchasesWords(lang)} />
}
