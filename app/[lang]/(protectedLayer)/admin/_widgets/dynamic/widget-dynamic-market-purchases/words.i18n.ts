// @local — the words of the widget «Покупки» (step 3); the server picks the language and passes them as a prop.
export type PurchasesWords = {
  version: string
  author: string
  got: string
  reinstall: string
  loading: string
  empty: string
  emptyHint: string
  unavailable: string
}

const en: PurchasesWords = {
  version: "version",
  author: "author",
  got: "got",
  reinstall: "Install again",
  loading: "Loading the purchases…",
  empty: "Nothing bought yet",
  emptyHint: "A starter appears here only after the core of the project confirms it was received.",
  unavailable: "The purchases did not load. The page itself works — try again later.",
}

const ru: PurchasesWords = {
  version: "версия",
  author: "автор",
  got: "получен",
  reinstall: "Установить ещё раз",
  loading: "Загружаю покупки…",
  empty: "Покупок пока нет",
  emptyHint: "Стартер появится здесь только после того, как ядро проекта подтвердит, что он получен.",
  unavailable: "Покупки не загрузились. Сама страница работает — попробуйте позже.",
}

export const purchasesWords = (lang: string): PurchasesWords => (lang === "ru" ? ru : en)
