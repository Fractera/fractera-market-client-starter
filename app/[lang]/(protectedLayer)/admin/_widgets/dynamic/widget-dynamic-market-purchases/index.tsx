// @local — the server entry of the widget «Покупки»: picks the words, renders the island.
import { PurchasesIsland } from "./island.client"
import { purchasesWords } from "./words.i18n"

export function Widget({ lang }: { lang: string }) {
  return <PurchasesIsland lang={lang} words={purchasesWords(lang)} />
}
