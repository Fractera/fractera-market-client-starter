// @local — the server entry of the widget «Рекомендации»: picks the words, renders the island.
import { RecommendationsView } from "./view.client"
import { recommendationsWords } from "./words.i18n"

export function Widget({ lang }: { lang: string }) {
  return <RecommendationsView lang={lang} words={recommendationsWords(lang)} />
}
