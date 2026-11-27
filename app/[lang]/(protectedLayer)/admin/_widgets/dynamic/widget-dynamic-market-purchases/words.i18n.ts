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
  install: Record<string, string>
  installStarted: string
  failed: string
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
  install: { none: "not installed yet", running: "installing — reload the page to see the result", started: "installing", installing: "installing", installed: "installed as element", done: "installed", failed: "install failed" },
  installStarted: "The core started the install again — no new payment.",
  failed: "It did not work:",
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
  install: { none: "ещё не установлен", running: "устанавливается — обновите страницу, чтобы увидеть итог", started: "устанавливается", installing: "устанавливается", installed: "установлен как элемент", done: "установлен", failed: "установка не удалась" },
  installStarted: "Ядро снова начало установку — без новой оплаты.",
  failed: "Не получилось:",
}

export const purchasesWords = (lang: string): PurchasesWords => (lang === "ru" ? ru : en)
