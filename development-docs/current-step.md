# Current step

**Active step:** 5 — the summary door and deep links for the Mini App card (`steps-new/5-summary-door-and-deep-links.md`).
State: planned 2026-11-27 ~22:00; the architect's «Оплата только на сайте за реальные деньги» recorded in the quiz; the research corrected (the custom element's card is a template release).

Serves: S-03, S-04
Stage: 1

**Last change:** step 4 closed (b89a686), 4-5 (ec1b143); research af90fe5, 526c8bc.

**Now:** 5-1 and 5-2 coded (ac15776); `describe:publish` answered 404 «the node does not know this element as a born one» — the card in git is current, the core's registry copy is not; prebuild RC=0; `test:summary` and the market test OK.

**Next action:** the core deploys → live: no key 401, with the key 200; eyes on `?open=` and `?element=` → close step 5.

**Queue:** empty. Open in the quiz: Q-01, Q-02 (defaults taken in step 2).

## The person's latest decisions (verbatim)

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
