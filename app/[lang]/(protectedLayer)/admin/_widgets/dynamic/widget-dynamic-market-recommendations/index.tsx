// @local — the server entry of the widget «Рекомендации»: picks the words, renders the island.
import { RecommendationsIsland } from "./island.client"
import { recommendationsWords } from "./words.i18n"

export function Widget({ lang }: { lang: string }) {
  return <RecommendationsIsland lang={lang} words={recommendationsWords(lang)} />
}
