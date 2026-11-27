# Step 4 — «Рекомендации» as a table with search, filters, sort and pages

Serves: S-03, S-04
Stage: 1

## Asked

The core's main agent, 2026-11-27 ~20:50, passing the architect's words (Telegram 1649, 20:49 UTC), verbatim:
«Хорошо давай тогда чуть-чуть покрути дизайн этого инструмента? Во-первых нужно посмотреть как у нас выглядит стандартный инструменты для похожих выдачей. Возьмите примера дашь борт Projects обрати внимание что там есть пагинация там есть поиск по таблице это не тот же самый поиск который у тебя конечно же там должен стоять твой поиск ну и фильтры должны быть например бесплатные, например от Fractera а также должна быть сортировку по цене верх и вниз переработать дизайн этой страницы».
The core's reading: the sample is Dashboard → Projects — one bordered card on top (a search field with a magnifier and «Найти», under it
a row of checkbox toggles and «Сбросить отбор» on the right), below it a bordered table (№ · name · description · …), rows per page and
the page switcher at the bottom; in the node this is the part «Table with search and pages» (`table-tools`). On this page the top
field stays the store search (a task in words → starters), the toggles are the filters «Бесплатные» and «От Fractera» (author), plus a
sort by price ↑ / ↓; the rows are the starters (name, author, price, the task that asked, state) with the three actions; pages below.
Remove the stage-0 «симуляция» rows (done 2026-11-27 as data: two rows deleted through the page's door, 200 each).

**Exists and reused:** `TableTools` lives in the core — `parts_find` «table with search and pages» → `npm run tool:take -- table-tools`
(taken as it is, never hand-built); the branch door `admin/api/market` and `lib/market` (step 3) unchanged unless a field is missing
(author is already in the rows).

**Limits:** the top field is the store search, never a filter of the rows; filters and sort work on the rows the page already has
(no new door); shadcn and the taken part only; every container with `data-block`.

**Substeps:**
1. Pass: design — `npm run tool:take -- table-tools`; the island of «Рекомендации» rebuilt on it: the store search in the top card,
   toggles «Бесплатные», «От Fractera», the price sort ↑ / ↓, «Сбросить отбор»; columns № · starter (link) · author · price · task ·
   state · actions; rows per page and pages. Check: `npm run eyes` at 1440 and 390 px with rows (one live search first, since the list
   is empty after the clean-up) — no overflow at 390; full `npm run prebuild` RC=0.
2. Pass: main — the filters and the sort proven on rows: free only, Fractera only, price ↑ / ↓, reset; the three actions still act.
   Check: a sample or the live page — each toggle changes the row count as expected.
3. Close: commit, report to the core; the core deploys and looks.
