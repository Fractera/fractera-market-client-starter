# Current step

**Active step:** 3 — reopened 2026-11-27 for substep 4c (`development-docs/steps-new/3-the-pages-of-recommendations-and-cart.md`).
State: 4c built, waiting for the deploy — the install call sent no slug (cause of «the starter is not in this order»). Now: POST
install {order, slug} per bought item, `again: true` only when that purchase was installed before (a first install after a failed
one is not «again»); «Покупки» ask GET install?order=&slug= once per page read while an install runs. test:recommend 25/25 incl.
the exact wire bodies; prebuild RC=0. Live next: «Установить ещё раз» on «Тестовый пост — стартер» once → a new element.

**Last change:** step 3 closed; commits 75c3eb4 (3-1), eb77e70 (3-2…4b), b9d3d1e (already-ordered), live on b9d3d1e.

**Next action:** wait for the core's main agent: the install refusal for order ord-9adb22… is on the core's side (backlog.md); the
paid path (payer window) and the texts pass are not started.

**Queue:** empty. Open in the quiz: Q-01, Q-02 (defaults taken in step 2).

## The person's latest decisions (verbatim)

- 2026-11-27, the core's main agent: «The contract: POST /api/node/market/install with JSON {order: "ord-…", slug: "<the starter's slug>"} (again: true only for «Установить ещё раз»); GET /api/node/market/install?order=…&slug=… → state running | installed (element) | failed (reason) | none … you then press «Получить»/«Установить» live once».

- 2026-11-27, the core's main agent: «ord-9adb22acd9ead131be080c96 is the core leader's own scripted test order … taking it as the old order is right.»
- 2026-11-27, the core's main agent: «Go on through the whole step 3 without stopping for the core … the free path first, payment hidden».
- 2026-11-27 ~19:40, the core's main agent: «Stage 0 is accepted … The three lines' «yes»: yes, as written in the plan».
- 2026-11-27, the core's main agent: «Отмечать этап 0 "done" в квизе пока не надо: это слово архитектора».
- 2026-11-27: «Да согласен разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это точно».
- 2026-11-27: «Вся концентрация дальнейшей работы только на реализации маркетплейса».
- 2026-11-27: «Да» — Plan 862 approved: one payment per cart, a free starter skips the payment, no refunds unless the law requires one, a failed install is installed again for free.
