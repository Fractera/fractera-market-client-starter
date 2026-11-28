# Current step

**Active step:** 7 — the public start page (`steps-new/7-the-public-start-page.md`, core step 862-16).
State: planned 2026-11-28 ~15:40; going on without waiting (the core's word). Step 6 stays open: 6-3 (the live paid path) waits for the store's priced test starter — it comes first when the slug arrives (`steps-new/6-the-paid-purchase.md`).

Serves: S-03
Stage: 1

**Last change:** 6-1, 6-2 deployed (65bc639); the reconcile of ord-be889e7cd713d1165e6e3d20 live.

**Now:** 7-1 coded (155f2da, main): `/api/me` 200 for a guest, `meta.noindex` (robots, no hreflang, out of the sitemap), the home page data in five sections (not `bare`), the page `_pages/authors`; the words are drafts from the architect's own.

**Done:** 7-2 (texts pass, 2026-11-28): the words of the home page and `_pages/authors` in ru and en through `humanizer`.

**Next action:** 7-3 — the eyes at 1440 and 390 on the public `/ru` after the core's deploy; then 7-4 close.

**Queue:** empty. Open in the quiz: Q-01, Q-02 (defaults taken in step 2).

## The person's latest decisions (verbatim)

- 2026-11-28, the architect (Telegram 608, 610): the public start page — verbatim in `steps-new/7-the-public-start-page.md`.

- 2026-11-27 23:18 UTC, the architect (Telegram 1737): «Следом после этого создавай как мы с тобой договорились покупку элементов. Для этого один из элементов сделать платным например один доллар попробуем его покупить через тестовой аккаунт Страйп».

- 2026-11-27 21:58 UTC, the architect (Telegram 1687): «Оплата только на сайте за реальные деньги».
- 2026-11-27 21:51 UTC, the architect (Telegram 1684): «Насколько я понимаю для телеграмм приложения нам нужно показывать поиск элементов для ядра и для кастомных элементов не так ли? Не вижу смысла показывать этот интерфейс для активных элементов согласен?»

- 2026-11-27 21:01 UTC, the architect (Telegram 1654): «Интерфейс который ты мне представил мне нравится сделай ещё так чтобы когда я выбираю какую-либо шаблон и нажимаю на его название этот экран делится на две части причём будем использовать специальный элемент shadcn - resizable по умолчанию установил состояние 50% но позволим делать диапазон от 30 до 70% то есть поставить ручку для дизайна ширины. В мобильной версии просто выезжает ящик с шириной экрана 90%».
- 2026-11-27 21:01 UTC, the architect (Telegram 1655): «Этот же макет будем использовать и для корзины и для купленных».

- 2026-11-27 20:57 UTC, the architect (Telegram 1651, through the core's main agent): «Также хочу сказать что у нас есть вкладка личный кабинет, там есть выдвижной ящик где мы должны оставить вкладку рекомендованные элементы, и корзина сможем из этой вкладки начать оптимизацию интерфейса. Очевидно что нам нужна ещё вкладка купленные потому что купить и активировать это не одно и тоже же согласен? И на этой вкладке мы нажимаемкнопку установить элементы. Сначала проработаем интерфейс на компьютере потом будем думать как это реализовать на Telegram мини приложение».

- 2026-11-27 20:49 UTC, the architect (Telegram 1649, through the core's main agent): «Хорошо давай тогда чуть-чуть покрути дизайн этого инструмента? Во-первых нужно посмотреть как у нас выглядит стандартный инструменты для похожих выдачей. Возьмите примера дашь борт Projects обрати внимание что там есть пагинация там есть поиск по таблице это не тот же самый поиск который у тебя конечно же там должен стоять твой поиск ну и фильтры должны быть например бесплатные, например от Fractera а также должна быть сортировку по цене верх и вниз переработать дизайн этой страницы».

- 2026-11-27, the core's main agent: «The contract: POST /api/node/market/install with JSON {order: "ord-…", slug: "<the starter's slug>"} (again: true only for «Установить ещё раз»); GET /api/node/market/install?order=…&slug=… → state running | installed (element) | failed (reason) | none … you then press «Получить»/«Установить» live once».

- 2026-11-27, the core's main agent: «ord-9adb22acd9ead131be080c96 is the core leader's own scripted test order … taking it as the old order is right.»
- 2026-11-27, the core's main agent: «Go on through the whole step 3 without stopping for the core … the free path first, payment hidden».
- 2026-11-27 ~19:40, the core's main agent: «Stage 0 is accepted … The three lines' «yes»: yes, as written in the plan».
- 2026-11-27, the core's main agent: «Отмечать этап 0 "done" в квизе пока не надо: это слово архитектора».
- 2026-11-27: «Да согласен разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это точно».
- 2026-11-27: «Вся концентрация дальнейшей работы только на реализации маркетплейса».
- 2026-11-27: «Да» — Plan 862 approved: one payment per cart, a free starter skips the payment, no refunds unless the law requires one, a failed install is installed again for free.
