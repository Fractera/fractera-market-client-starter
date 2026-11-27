# Current step

**Active step:** 3 — the pages of recommendations and the cart (`development-docs/steps-new/3-the-pages-of-recommendations-and-cart.md`).
State: building; substep 3-1 (design pass) done 2026-11-27 — three page folders in admin `_pages/` (recommendations, cart, purchases)
and three islands `widget-dynamic-market-*` with their skeleton, empty and unavailable states; the data and the actions are not wired yet.
Substep 3-2 (main pass) next.

Serves: S-03, S-04, S-05, S-06, S-07, R-01, R-02, R-03
Stage: 1

**Last change:** substep 3-1 — the pages and their islands; full `npm run prebuild` RC=0; `npm run eyes` at 1440 and 390 px on a
temporary `next dev` (port 24797, stopped after): the three pages answer 200, the skeletons draw, no console errors. The live site shows
the islands only after a build (the step closes with one build, substep 7).

**Next action:** `npm run pass -- main` → substep 3-2: the recommendations wired — rows by task from `lib/market`, keep · delete · to the
cart through server-side calls that check the architect's session.

**Queue:** empty. Open in the quiz: Q-01, Q-02 (defaults taken in step 2).

## The person's latest decisions (verbatim)

- 2026-11-27 ~19:40, the core's main agent: «Stage 0 is accepted … The three lines' «yes»: yes, as written in the plan» — with «search, cart, purchase and install through the core's doors /api/node/market/*, your own key; payment hidden, the free path first; the stub replaced by the core's search door». Report to the core when 3-1 is done.

- 2026-11-27, the core's main agent: «Отмечать этап 0 "done" в квизе пока не надо: это слово архитектора» — stage 0 stays open until the architect says so.

- 2026-11-27, the core's main agent: «Да» — the plan of stage 0 accepted as written; substep 2-1 not needed, the search v2 standard given.
- 2026-11-27: «Да согласен разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это точно» — The client is a native element pre-installed in every project and comes back with a server reinstall.
- 2026-11-27: «каждый поставляемый в комплекте MarketPlace клиент имеет возможность извлекать элементы из MarketPlace и хранить историю …» — The client fetches starters from the store and keeps the history of choices.
- 2026-11-27: «Вся концентрация дальнейшей работы только на реализации маркетплейса» — The marketplace is the one focus of the work.
- 2026-11-27: «Да» — Plan 862 approved: one payment per cart, a free starter skips the payment, no refunds unless the law requires one, a failed install is installed again for free.
