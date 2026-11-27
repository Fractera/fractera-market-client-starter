# Current step

**Active step:** 2 — the recommendation list with the history of choices
(`development-docs/steps-new/2-the-recommendation-list-with-choice-history.md`). State: waiting for the «yes».

Serves: S-01, R-01, R-03, R-04, E-01, E-02, E-03
Stage: 0

**Last change:** step 1 closed (`steps-done/1.md`): the quiz is enough for stage 0; step 2 planned.

**Next action:** the «yes» of the core's main agent (for the architect) → substep 2-1: ask the core for the search v2 contract.

**The three confirming lines (given 2026-11-27):**
- If I understood right, you ask for stage 0: an element asks for a recommendation — rows appear in the list, the person's choices are
  kept as the task's history and go out with every next search; the store is a stub of the same standard.
- To do it I will build the data (recommendations, cart, history) in my space of the data element, one store module with a stub that
  will later call the core's door 862-2, and the doors recommend · recommendations · choice · cart · history with the project key.
  I will not touch pages, the bot, payment, install, the core or neighbours; no store address and no key here.
- In the end: two requests on one task — the second carries the first's history; a request without the key is refused; «cart» twice
  gives one row; no answer says «куплено». Checks: full `npm run prebuild`, live curl of each door, grep for store addresses and keys.

**Queue:** empty.

## The person's latest decisions (verbatim)

- 2026-11-27: «Да согласен разумно делать это как нативный элемент … при переустановке сервера он должен приезжать это точно» — The client is a native element pre-installed in every project and comes back with a server reinstall.
- 2026-11-27: «каждый поставляемый в комплекте MarketPlace клиент имеет возможность извлекать элементы из MarketPlace и хранить историю …» — The client fetches starters from the store and keeps the history of choices.
- 2026-11-27: «Вся концентрация дальнейшей работы только на реализации маркетплейса» — The marketplace is the one focus of the work.
- 2026-11-27: «Да» — Plan 862 approved: one payment per cart, a free starter skips the payment, no refunds unless the law requires one, a failed install is installed again for free.
- 2026-11-27: «Давай определим кто что строит … Ты здесь самое главное поэтому ты сейчас распредели все эти обязанности» — The creator agent leads the quartet; this client grows on the creator's node by its own agent on the creator's tasks.
