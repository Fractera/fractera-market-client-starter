# Backlog — built but not explained, built halfway, or promised

What exists only partly: a capability built and not described, a page or door built halfway, a thing promised to the person or to
another agent and not built yet. Without this file such things are found again by accident — or never.

- A line is added the day the gap appears: when a step closes with something left undone, when a promise is given, when you
  find a half-built thing on the way.
- A line is deleted by the same commit that closes the gap — deleting it without the work buys a clean list and nothing else.
- Not here: dead ends already paid for (`anti-patterns.md`), texts in one language (`translation-debt.md`), dropped work
  (`cancelled.md`), requests not started yet (`pre-steps/`).

Format, one line per item, address first:

```
- `<path or page>` — <what is missing> · <why it is not done; the person's word if any> · <date>
```
- `/ru/admin/recommendations` — stage-0 stub rows («симуляция», tasks «картинки для соцсетей», «картинки для постов в блог») still in the list · data, the architect may delete them · 2026-11-27
- `admin/_widgets/dynamic/widget-dynamic-market-*` — the texts pass (step 3, substep 6) not run · the words exist in ru and en · 2026-11-27
- the starter card «Что умеет» — the store gives the description in English only, also for `lang: ru` · ask the store for a description in the person's language · 2026-11-27
- `/ru/admin/recommendations` — the two rows found before f5e96d8 carry no version and no report · they fill when the store offers the starter again; no back-fill built · 2026-11-27
- `/ru/admin/recommendations` opened by a guest — its widgets still ask the locked doors (cart, recommendations, history): 401 lines in the console behind the access window · ask them only after `/api/me` names a role · 2026-11-28
