# Current step

**Active step:** 4 — «Рекомендации» as a table with search, filters, sort and pages (`development-docs/steps-new/4-the-recommendations-as-a-table.md`).
State: planned 2026-11-27; the stage-0 simulated rows deleted (data). Substep 4-1 is the design pass.

Serves: S-03, S-04
Stage: 1

**Last change:** step 3 closed (f7637b1); step 4 planned.

**Next action:** `npm run pass -- design` → substep 4-1: take `table-tools`, rebuild the recommendations island on it.

**Queue:** empty. Open in the quiz: Q-01, Q-02 (defaults taken in step 2).

## The person's latest decisions (verbatim)

- 2026-11-27 20:49 UTC, the architect (Telegram 1649, through the core's main agent): «Хорошо давай тогда чуть-чуть покрути дизайн этого инструмента? Во-первых нужно посмотреть как у нас выглядит стандартный инструменты для похожих выдачей. Возьмите примера дашь борт Projects обрати внимание что там есть пагинация там есть поиск по таблице это не тот же самый поиск который у тебя конечно же там должен стоять твой поиск ну и фильтры должны быть например бесплатные, например от Fractera а также должна быть сортировку по цене верх и вниз переработать дизайн этой страницы».

- 2026-11-27, the core's main agent: «The contract: POST /api/node/market/install with JSON {order: "ord-…", slug: "<the starter's slug>"} (again: true only for «Установить ещё раз»); GET /api/node/market/install?order=…&slug=… → state running | installed (element) | failed (reason) | none … you then press «Получить»/«Установить» live once».

- 2026-11-27, the core's main agent: «ord-9adb22acd9ead131be080c96 is the core leader's own scripted test order … taking it as the old order is right.»
- 2026-11-27, the core's main agent: «Go on through the whole step 3 without stopping for the core … the free path first, payment hidden».
- 2026-11-27 ~19:40, the core's main agent: «Stage 0 is accepted … The three lines' «yes»: yes, as written in the plan».
- 2026-11-27, the core's main agent: «Отмечать этап 0 "done" в квизе пока не надо: это слово архитектора».
- 2026-11-27: «Да согласен разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это точно».
- 2026-11-27: «Вся концентрация дальнейшей работы только на реализации маркетплейса».
- 2026-11-27: «Да» — Plan 862 approved: one payment per cart, a free starter skips the payment, no refunds unless the law requires one, a failed install is installed again for free.
