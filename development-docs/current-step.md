# Current step

**Active step:** 3 — the pages of recommendations and the cart (`development-docs/steps-new/3-the-pages-of-recommendations-and-cart.md`).
State: building; substep 3-1 (design pass) done 2026-11-27 — three page folders in admin `_pages/` (recommendations, cart, purchases)
and three islands `widget-dynamic-market-*` with their skeleton, empty and unavailable states; the data and the actions are not wired yet.
Substeps 3-2…4b (main pass) building together 2026-11-27: the core's leader asked to go through the whole step without stopping
(«Go on through the whole step 3 without stopping for the core … the free path first, payment hidden»).

Serves: S-03, S-04, S-05, S-06, S-07, R-01, R-02, R-03
Stage: 1

**Last change:** substeps 3-2…4b (commit eb77e70), waiting for the build. Before: substep 3-1 (commit 75c3eb4) — the pages and their islands; full `npm run prebuild` RC=0; `npm run eyes` at 1440 and 390 px on a
temporary `next dev` (port 24797, stopped after): the three pages answer 200, the skeletons draw, no console errors. The live site shows
the islands only after a build (the step closes with one build, substep 7).

**Live run 2026-11-27 20:06 on c14bc19:** search through the page's door → «Тестовый пост — стартер», `mode: live`, not simulated ✓;
«В корзину» clicked in the browser (`npm run eyes --click`) → the row «cart», one cart line ✓; «Получить» clicked → buttons went busy,
the eyes window closed before the answer, nothing recorded. The same POST by curl → `202 {state:"already-ordered"}`: the core answers a
starter ordered before with `already-ordered` and the old order on each item (`ord-9adb22acd9ead131be080c96`, paid, tag v0.1.0) —
checkout did not know this answer. Fixed in lib/market (the old order taken, checked with the core, recorded, installed; test added,
20/20, prebuild RC=0). Whether the eyes click made ord-9adb is not known (the core's order answer has no time).
Access (5) live: anonymous → the branch gate «Эта страница вам недоступна» (390 px), the door `401 architect_only` ✓; another role
(admin passes the branch gate) gets 403 from the door — by code, not checked live (no such session here).

**Next action:** the second build — «Deploy» on «Preview & Deploy» by the architect or the leader (deploy-element: never on my own initiative),
then the live end-to-end on /ru/admin/recommendations → cart → «Получить» → purchases, the access check (5), close the step (7).

**Case matrix (before-a-build):** plane — this computer only (no server for this node's market today); address — as born
(market.throughsongs.com), the pages are architect-only, so the own-domain/Cloudflare copy shows only the sign-in; caller — the
architect's browser (session checked in the branch door), a showcase visitor (POST 403), a neighbour (no access to the branch door;
its doors /api/* unchanged). Proven before the build: types, full prebuild RC=0, test:recommend 19/19. Only live: the core's
purchase/install answer to my process, the islands drawing the rows.
A temporary `next dev` did not load this element's keys (a keyed door answered bad_key), so the live check waits for the build.

**Queue:** empty. Open in the quiz: Q-01, Q-02 (defaults taken in step 2).

## Measured 2026-11-27 (the core's doors, own key)

- `POST /api/node/market/search {request 1-500, lang, history:[{starter,action,task}]}` → v2 `mode: live`, two free test starters
  (`fractera-test-post-starter`, `fractera-test-image-starter`); a rejected starter of the same task is not returned.
- `POST /api/node/market/purchase {cart:[slugs], consent:{immediateDelivery:true,noRefund:true}}` → `{ok, state:"paid", order, items:[{slug,name,tag}], total}`
  for a free cart. One probe order `ord-be889e7cd713d1165e6e3d20` (image starter) made by curl while learning the shape.
- `POST /api/node/market/order {order}` → `{ok, order, paid, items}`; `GET /api/node/market/install` → `{ok, state}`; `POST install {order}`.

## The person's latest decisions (verbatim)

- 2026-11-27 ~19:40, the core's main agent: «Stage 0 is accepted … The three lines' «yes»: yes, as written in the plan» — with «search, cart, purchase and install through the core's doors /api/node/market/*, your own key; payment hidden, the free path first; the stub replaced by the core's search door». Report to the core when 3-1 is done.

- 2026-11-27, the core's main agent: «Отмечать этап 0 "done" в квизе пока не надо: это слово архитектора» — stage 0 stays open until the architect says so.

- 2026-11-27, the core's main agent: «Да» — the plan of stage 0 accepted as written; substep 2-1 not needed, the search v2 standard given.
- 2026-11-27: «Да согласен разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это точно» — The client is a native element pre-installed in every project and comes back with a server reinstall.
- 2026-11-27: «каждый поставляемый в комплекте MarketPlace клиент имеет возможность извлекать элементы из MarketPlace и хранить историю …» — The client fetches starters from the store and keeps the history of choices.
- 2026-11-27: «Вся концентрация дальнейшей работы только на реализации маркетплейса» — The marketplace is the one focus of the work.
- 2026-11-27: «Да» — Plan 862 approved: one payment per cart, a free starter skips the payment, no refunds unless the law requires one, a failed install is installed again for free.
