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

The core's main agent, 2026-11-27 ~21:00, passing the architect's words (Telegram 1651, 20:57 UTC), verbatim:
«Также хочу сказать что у нас есть вкладка личный кабинет, там есть выдвижной ящик где мы должны оставить вкладку рекомендованные элементы, и корзина сможем из этой вкладки начать оптимизацию интерфейса. Очевидно что нам нужна ещё вкладка купленные потому что купить и активировать это не одно и тоже же согласен? И на этой вкладке мы нажимаемкнопку установить элементы. Сначала проработаем интерфейс на компьютере потом будем думать как это реализовать на Telegram мини приложение».
The core's reading, into this step: the «Личный кабинет» drawer gets three entries — «Рекомендованные элементы», «Корзина», «Купленные»;
«Покупки» becomes «Купленные», where every bought starter shows bought vs installed and carries «Установить» (installed → its element
and address; «Установить ещё раз» only for an installed one). The Telegram Mini App later, not now. Also: at 390 the pager wraps
«Страница 1 из 1» — tidy it on a phone, the desktop first.

The core's main agent, 2026-11-27 ~21:05, passing the architect's words (Telegram 1654, 21:01 UTC), verbatim:
«Интерфейс который ты мне представил мне нравится сделай ещё так чтобы когда я выбираю какую-либо шаблон и нажимаю на его название этот экран делится на две части причём будем использовать специальный элемент shadcn - resizable по умолчанию установил состояние 50% но позволим делать диапазон от 30 до 70% то есть поставить ручку для дизайна ширины. В мобильной версии просто выезжает ящик с шириной экрана 90%».
And (Telegram 1655, 21:01 UTC), verbatim: «Этот же макет будем использовать и для корзины и для купленных».
The core's reading: a click on a starter's name splits the page with shadcn Resizable (horizontal, the table left, the starter's card
right; 50/50 by default, each side 30–70, with a handle); the card shows everything the store gives (name, author, price, version,
description, what it can do, the task, its state) with the same actions and a close; below md the card opens in a side drawer at 90 %
of the screen width. One layout for «Рекомендованные элементы», «Корзина» and «Купленные» — built once, reused, never three copies.

**Exists and reused:** `TableTools` lives in the core — `parts_find` «table with search and pages» → `npm run tool:take -- table-tools`
(taken as it is, never hand-built); the branch door `admin/api/market` and `lib/market` (step 3) unchanged unless a field is missing
(author is already in the rows).

**Limits:** the top field is the store search, never a filter of the rows; filters and sort work on the rows the page already has
(no new door); shadcn and the taken part only; every container with `data-block`.

**Substeps:**
1. Pass: design — [coded 2026-11-27; eyes wait for the build] `npm run tool:take -- table-tools` (then `tool:own`: the taken body had no outside search, no narrowing filter, no sort, and raw controls); the island of «Рекомендации» rebuilt on it: the store search in the top card,
   toggles «Бесплатные», «От Fractera», the price sort ↑ / ↓, «Сбросить отбор»; columns № · starter (link) · author · price · task ·
   state · actions; rows per page and pages. Check: `npm run eyes` at 1440 and 390 px with rows (one live search first, since the list
   is empty after the clean-up) — no overflow at 390; full `npm run prebuild` RC=0.
2. Pass: main — [done 2026-11-27 on the deployed 4-1; eyes 21:04 UTC] the filters and the sort proven on rows: free only, Fractera only, price ↑ / ↓, reset; the three actions still act.
   Check: a sample or the live page — each toggle changes the row count as expected.
   Evidence: one live search added a second row (2 rows, both free, both Fractera — the store holds no paid or foreign starter
   today); both filters on → «Показано 1-2 из 2» (right: both admit every row); «Цена ↓» swapped two equal free rows → fixed
   (equal prices keep the list's order both ways). Not proven live: narrowing by a paid or a foreign row — none exists in the store.
3. Pass: main — [coded 2026-11-27; eyes wait for the core's build] the drawer and «Купленные» (Telegram 1651): three drawer entries (labels from the pages' own titles, admin roles);
   «Покупки» → «Купленные» (address `/admin/purchases` kept); each row: «Куплен» and the install state (not installed · installing ·
   installed as <element> with its address · failed with the reason); the button «Установить» when not installed or failed,
   «Установить ещё раз» only when installed; the pager on a phone without a wrapped label. Check: prebuild RC=0; eyes 1440 and 390
   on /ru/admin/purchases and the open drawer; the one live purchase shows its real state.
4. Pass: main — [coded 2026-11-27; eyes wait for the core's build] one master-detail layout (Telegram 1654, 1655): shadcn `resizable` taken by `npx shadcn add`; one shared
   part — the table left, the card right (50/50, 30–70, handle), a 90 % side `Sheet` below md; one card of a starter; «Корзина» and
   «Купленные» become `table-tools` tables on it like «Рекомендованные элементы». Check: prebuild RC=0; after the core's build eyes
   1440 (a name clicked → split; the handle) and 390 (a name clicked → the drawer) on all three pages.
   Done: `components/ui/resizable.tsx` by `npx shadcn add` (its `import { cn } from "cn"` fixed to `@/lib/utils`, the stray npm
   package `cn` removed — the known CLI defect); the part `table-detail` (components/table, card in parts.json); one
   `StarterCard` in `admin/_components/`; the three islands on it; while the card is open the table keeps the main columns
   only; the doors give `description` on a row and `about` (the latest recommendation) on cart lines and purchases.
   Not given by the store search: a version before the purchase — the card shows a version only on «Купленные».
5. Close: commit, report to the core; the core deploys and looks.
