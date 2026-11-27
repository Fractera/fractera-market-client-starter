// @local — the work of the marketplace client's doors (stage 0): recommend, the list, the choice, the cart, the history.
// R-04: an asking element hears «рекомендовано, ждёт решения человека», never «куплено» before the core confirms the payment.
import { randomUUID } from 'node:crypto'
import * as store from './store.mjs'
import { remoteRepo } from './repo.mjs'

let repo = null
let search = store.search
let core = store
const R = () => (repo ??= remoteRepo())
/** For the tests: another repo, another search, another core (purchase, order, install). */
export function use({ repo: r, search: s, core: c } = {}) { if (r) repo = r; if (s) search = s; if (c) core = c }

const MAX_ACTIVE = 10 // Q-01 default: active rows per task
const ACTIVE = new Set(['waiting', 'kept', 'cart'])
const SAYS = { ru: 'рекомендовано, ждёт решения человека', en: 'recommended, waiting for the person’s decision' }
const now = () => new Date().toISOString()
const bad = (reason, status = 400) => ({ status, body: { error: 'bad_request', reason } })
const text = (v, max) => (typeof v === 'string' && v.trim().length >= 1 && v.trim().length <= max ? v.trim() : null)
const publicRow = (r) => ({
  id: r.id, task: r.task, element: r.element, starter: r.slug, name: r.name, source: r.source, simulated: r.simulated,
  page: r.page, price: { amount: r.price_amount, currency: r.price_currency }, usefulness: r.usefulness, why: r.why,
  bought: r.bought, status: r.status, time: r.updated_at, author: r.author ?? '', description: r.description ?? '',
  version: r.version ?? '', report: r.report ?? null,
})

/** What the store said about a starter, from its latest recommendation row — the card of «Корзина» and «Купленные» (step 4-4). */
const aboutOf = (rows, slug) => {
  const r = rows.filter((x) => x.slug === slug).at(-1)
  return r ? publicRow(r) : null
}

async function isBought(slug) {
  return (await R().history()).some((h) => h.slug === slug && h.action === 'bought')
}

export async function recommend(input, caller) {
  const task = text(input?.task, 500)
  if (!task) return bad('task: 1-500 characters')
  // A neighbour asks for itself only: the element comes from its key, never from the input.
  const element = caller?.kind === 'element' ? caller.id : text(input?.element, 100)
  if (!element) return bad('element: the asking element id')
  const lang = input?.lang === 'en' ? 'en' : 'ru'

  const history = (await R().history(task)).map((h) => ({ starter: h.slug, action: h.action, task: h.task }))
  const answer = await search({ v: 2, node: null, element, request: task, lang, limit: 8, history })
  if (!answer || answer.error || !Array.isArray(answer.items)) {
    return { status: 502, body: { error: 'store_unavailable', reason: answer?.reason ?? answer?.error ?? 'no answer' } }
  }
  const rows = await R().rows({ task })
  const known = new Set(rows.filter((r) => ACTIVE.has(r.status) || r.status === 'deleted' || r.status === 'bought').map((r) => r.slug))
  const rejected = new Set(history.filter((h) => h.action === 'rejected').map((h) => h.starter))
  const added = []
  for (const it of answer.items) {
    if (!it?.slug || known.has(it.slug) || rejected.has(it.slug)) continue
    const row = {
      id: randomUUID(), task, element, slug: it.slug, name: String(it.name ?? it.slug),
      source: answer.mode === 'lagrix' ? 'lagrix' : 'fractera', simulated: answer.mode === 'stub' || answer.mode === 'lagrix',
      page: it.url ?? it.page ?? null, description: it.description ?? null,
      // The store's research of this version (step 4-4): its tag and the report the store asks to read before buying.
      version: it.validation?.tag ?? null, report: it.validation?.report ?? null,
      author: typeof it.author === 'object' ? String(it.author?.name ?? '') : String(it.author ?? ''),
      price_amount: Number(it.price?.amount ?? 0), price_currency: String(it.price?.currency ?? 'USD'),
      usefulness: Number(it.whyFits?.usefulness ?? it.usefulness?.[0]?.score ?? 0),
      why: JSON.stringify(it.whyFits ?? {}), bought: !!it.bought || (await isBought(it.slug)),
      status: 'waiting', created_at: now(), updated_at: now(),
    }
    await R().putRow(row); added.push(row); known.add(it.slug)
  }
  // Q-01: above MAX_ACTIVE the oldest waiting/kept rows (never a cart row) leave the list into the history as «kept».
  const active = (await R().rows({ task })).filter((r) => r.status === 'waiting' || r.status === 'kept')
  const cartCount = (await R().rows({ task })).filter((r) => r.status === 'cart').length
  for (const r of active.slice(0, Math.max(0, active.length + cartCount - MAX_ACTIVE))) {
    await R().putRow({ ...r, status: 'archived', updated_at: now() })
    await R().putHistory({ task, slug: r.slug, action: 'kept', at: now() })
  }
  const list = (await R().rows({ task })).filter((r) => ACTIVE.has(r.status))
  return {
    status: 200,
    body: {
      state: 'recommended-awaiting-decision', says: SAYS[lang], task, element,
      added: added.length, store: { mode: answer.mode, summary: answer.summary },
      rows: list.map((r) => ({ id: r.id, name: r.name, page: r.page, price: { amount: r.price_amount, currency: r.price_currency }, status: r.status, simulated: r.simulated })),
    },
  }
}

export async function recommendations(input, caller) {
  const element = caller?.kind === 'element' ? caller.id : text(input?.element, 100) ?? undefined
  const task = text(input?.task, 1000) ?? undefined
  const rows = (await R().rows({ task, element })).filter((r) => ACTIVE.has(r.status))
  const tasks = {}
  for (const r of rows) (tasks[r.task] ??= []).push(publicRow(r))
  return { status: 200, body: { tasks: Object.entries(tasks).map(([t, rs]) => ({ task: t, rows: rs })) } }
}

const personOnly = (caller) => caller?.kind === 'element'
  ? { status: 403, body: { error: 'person_only', reason: 'a choice and the cart are the person’s acts' } } : null

export async function choice(input, caller) {
  const no = personOnly(caller); if (no) return no
  const id = text(input?.row, 100)
  const action = ['keep', 'delete', 'cart'].includes(input?.action) ? input.action : null
  if (!id || !action) return bad('row: the row id; action: keep | delete | cart')
  const row = await R().getRow(id)
  if (!row || !ACTIVE.has(row.status)) return { status: 404, body: { error: 'not_found', reason: 'no such active row' } }
  if (action === 'cart') {
    if (row.bought || (await isBought(row.slug))) return { status: 409, body: { error: 'already_bought', reason: 'уже куплен — установите его на странице «Купленные»' } }
    await R().addCart({ slug: row.slug, name: row.name, price_amount: row.price_amount, price_currency: row.price_currency, added_at: now() })
  }
  if (row.status === 'cart' && action !== 'cart') await R().removeCart(row.slug)
  const status = action === 'delete' ? 'deleted' : action === 'keep' ? 'kept' : 'cart'
  await R().putRow({ ...row, status, updated_at: now() })
  await R().putHistory({ task: row.task, slug: row.slug, action: action === 'delete' ? 'rejected' : 'kept', at: now() })
  return { status: 200, body: { row: publicRow({ ...row, status, updated_at: now() }) } }
}

async function cartBody() {
  await reconcile()
  const lines = await R().cart()
  const rows = lines.length ? await R().rows() : []
  const total = lines.reduce((s, l) => s + Number(l.price_amount), 0)
  const mine = await R().orders()
  const waiting = mine.find((o) => o.state === 'awaiting') ?? null
  const locked = new Set(waiting ? JSON.parse(waiting.slugs || '[]') : [])
  const last = mine[0] ?? null
  return {
    lines: lines.map((l) => ({ starter: l.slug, name: l.name, price: { amount: l.price_amount, currency: l.price_currency }, added: l.added_at, about: aboutOf(rows, l.slug), locked: locked.has(l.slug) })),
    total: { amount: total, currency: lines[0]?.price_currency ?? 'USD' },
    // Step 6: the order waiting for the payer (lines locked), and the last check that found it unpaid (the cart unlocked, the order kept).
    awaiting: waiting ? { order: waiting.order_id, total: { amount: waiting.total_amount, currency: waiting.total_currency }, at: waiting.at } : null,
    unpaid: last && last.state === 'unpaid' ? { order: last.order_id, at: last.updated_at } : null,
  }
}

// A line leaving the cart turns its row back to «kept», so the list and the cart never disagree.
async function uncart(slug) {
  for (const r of await R().rows()) if (r.status === 'cart' && (!slug || r.slug === slug)) await R().putRow({ ...r, status: 'kept', updated_at: now() })
}

export async function cart(input, caller) {
  const no = personOnly(caller); if (no) return no
  const action = input?.action
  if (action === undefined) return { status: 200, body: await cartBody() }
  if ((await R().orders()).some((o) => o.state === 'awaiting')) {
    return { status: 409, body: { error: 'awaiting_payment', reason: 'the cart waits for the payment of its order — check the payment first' } }
  }
  if (action === 'clear') { await R().clearCart(); await uncart(); return { status: 200, body: await cartBody() } }
  const slug = text(input?.starter, 200)
  if (!slug || !['add', 'remove'].includes(action)) return bad('action: add | remove | clear; starter: the starter slug')
  if (action === 'remove') { await R().removeCart(slug); await uncart(slug); return { status: 200, body: await cartBody() } }
  const row = (await R().rows()).filter((r) => r.slug === slug && ACTIVE.has(r.status)).at(-1)
  if (!row) return { status: 404, body: { error: 'not_found', reason: 'the starter is not in the recommendations' } }
  return choice({ row: row.id, action: 'cart' }, caller).then(async (r) => (r.status === 200 ? { status: 200, body: await cartBody() } : r))
}

export async function history(input) {
  const task = text(input?.task, 1000) ?? undefined
  return { status: 200, body: { history: (await R().history(task)).map((h) => ({ task: h.task, starter: h.slug, action: h.action, time: h.at })) } }
}

// ── The free path (step 3-4b): the cart → the core's purchase → its order → its install. R-04: a starter is «bought» only when the
// core answers `paid`; a paid cart is refused here — payment stays hidden until the core's payer window is opened to this client.
const isPaidState = (a) => a?.ok && (a.state === 'paid' || a.paid === true)

export async function checkout(input, caller) {
  const no = personOnly(caller); if (no) return no
  // The architect's rule: «Стартер передаётся сразу; возврата нет, кроме случаев, когда этого требует закон» — ticked by the person.
  if (input?.consent !== true) return { status: 400, body: { error: 'consent_required', reason: 'the person has not agreed to immediate delivery and no refund' } }
  const lines = await R().cart()
  if (!lines.length) return bad('the cart is empty')
  if ((await R().orders()).some((o) => o.state === 'awaiting')) {
    return { status: 409, body: { error: 'awaiting_payment', reason: 'an order of this cart already waits for its payment' } }
  }
  const lang = input?.lang === 'en' ? 'en' : 'ru'
  const slugs = lines.map((l) => l.slug)
  const p = await core.purchase(slugs, lang)
  if (!p?.ok) return { status: 502, body: { error: 'core_refused', reason: p?.reason ?? 'no answer' } }
  const total = { amount: Number(p.total?.amount ?? lines.reduce((s, l) => s + Number(l.price_amount), 0)), currency: String(p.total?.currency ?? lines[0]?.price_currency ?? 'USD') }

  // A priced cart: the core opened the payer's window (Fractera's Stripe Checkout, its own); the cart waits, nothing is installed.
  if (p.state === 'awaiting-payer' && p.order) {
    await R().putOrder({ order_id: p.order, state: 'awaiting', total_amount: total.amount, total_currency: total.currency, slugs: JSON.stringify(slugs), win: p.window ?? null, at: now(), updated_at: now() })
    return { status: 202, body: { state: 'awaiting-payer', order: p.order, total } }
  }
  // A new order answers `paid` with its id; a starter this project already ordered answers `already-ordered` with the old order on
  // each item (R-05: one copy per buyer, no second payment) — both go on through the core's own word on that order.
  const ids = isPaidState(p) && p.order ? [p.order]
    : p.state === 'already-ordered' ? [...new Set((p.items ?? []).map((i) => i?.order).filter(Boolean))] : []
  if (!ids.length) return { status: 202, body: { state: p.state ?? 'pending', order: p.order ?? null } }
  const items = []; const install = []
  for (const id of ids) {
    if (p.state !== 'already-ordered') await R().putOrder({ order_id: id, state: 'awaiting', total_amount: total.amount, total_currency: total.currency, slugs: JSON.stringify(slugs), win: null, at: now(), updated_at: now() })
    const done = await settleOrder(id, { install: true })
    items.push(...done.items); install.push(...done.install)
  }
  if (!items.length) return { status: 202, body: { state: 'pending', order: ids[0] } }
  return { status: 200, body: { state: p.state === 'already-ordered' ? 'already-ordered' : 'paid', orders: ids, items, install } }
}

/** The core's word on one order: paid → each item to «Купленные» (rows «bought», history, out of the cart) and, when asked, its
 *  install; the local order turns `paid`. Not paid → nothing moves. An item already in «Купленные» from this order is not moved twice. */
async function settleOrder(id, { install = false } = {}) {
  const o = await core.order(id)
  if (o?.ok === false && o.status === 404) return { paid: false, missing: true, items: [], install: [] }
  if (!isPaidState(o)) return { paid: false, items: [], install: [] }
  const rows = await R().rows()
  const have = await R().purchases()
  const items = []; const installs = []
  for (const it of o.items ?? []) {
    if (!it?.slug || have.some((x) => x.slug === it.slug && x.order_id === id)) continue
    const row = rows.filter((r) => r.slug === it.slug).at(-1)
    await R().putPurchase({
      slug: it.slug, name: String(it.name ?? row?.name ?? it.slug), tag: String(it.tag ?? ''), author: row?.author ?? '',
      page: row?.page ?? null, order_id: id, at: now(), install_state: 'none', install_reason: null,
    })
    for (const r of rows.filter((x) => x.slug === it.slug)) {
      await R().putRow({ ...r, bought: true, status: ACTIVE.has(r.status) ? 'bought' : r.status, updated_at: now() })
      await R().putHistory({ task: r.task, slug: r.slug, action: 'bought', at: now() })
    }
    await R().removeCart(it.slug)
    items.push(it.slug)
    if (install) installs.push({ order: id, slug: it.slug, ...(await startInstall(id, it.slug, false)) })
  }
  const mine = (await R().orders()).find((x) => x.order_id === id)
  await R().putOrder({ ...(mine ?? { order_id: id, total_amount: 0, total_currency: 'USD', slugs: JSON.stringify((o.items ?? []).map((i) => i.slug)), win: null, at: now() }), state: 'paid', updated_at: now() })
  return { paid: true, items, install: installs }
}

/** The payer said «Готово» (or the person pressed «Проверить оплату»): ask the core whether the order is paid. Paid → «Купленные» and
 *  the install; not paid → the cart unlocks and says the payment has not arrived; the order is kept (step 6). */
export async function confirmPayment(input, caller) {
  const no = personOnly(caller); if (no) return no
  const id = text(input?.order, 40)
  if (!id || !/^ord-[0-9a-f]{24}$/.test(id)) return bad('order: ord-<24 hex>')
  const done = await settleOrder(id, { install: true })
  if (done.missing) return { status: 404, body: { error: 'not_found', reason: 'the core does not know this order' } }
  if (done.paid) return { status: 200, body: { state: 'paid', order: id, items: done.items, install: done.install } }
  const mine = (await R().orders()).find((x) => x.order_id === id)
  if (mine) await R().putOrder({ ...mine, state: 'unpaid', updated_at: now() })
  return { status: 200, body: { state: 'unpaid', order: id } }
}

/** After a reload both pages read the core's orders (never the browser's memory): a paid order whose items are not in «Купленные»
 *  is settled there — without starting an install the person did not press. Once per read of a page; a silent core changes nothing. */
async function reconcile() {
  const a = await core.orders?.().catch(() => null)
  if (!a?.ok || !Array.isArray(a.orders)) return
  const have = await R().purchases()
  for (const o of a.orders) {
    if (!o?.paid || !o.order) continue
    const missing = (o.items ?? []).some((it) => it?.slug && !have.some((x) => x.slug === it.slug))
    const mine = (await R().orders()).find((x) => x.order_id === o.order)
    if (missing || (mine && mine.state !== 'paid')) await settleOrder(o.order, { install: false })
  }
}

// The install state is kept per purchase; `install_reason` holds the core's detail — the reason of a failure or the new element.
// Installed: the element and, when the core names it, its address — kept as one JSON line {id, address} (step 4-3).
const ADDRESS_KEYS = ['address', 'url', 'href', 'origin']
const addressOf = (...vs) => { for (const v of vs) for (const k of ADDRESS_KEYS) if (v && typeof v === 'object' && typeof v[k] === 'string') return v[k]; return null }
const detailOf = (a) => {
  if (a?.state !== 'installed') return a?.reason ?? null
  const el = a.element
  const id = el == null ? null : typeof el === 'string' ? el : String(el.id ?? el.name ?? '')
  return id ? JSON.stringify({ id, address: addressOf(el, a) }) : null
}
const textOf = (v) => (v == null ? null : typeof v === 'string' ? v : String(v.id ?? v.name ?? JSON.stringify(v)))
/** The stored detail of an installed purchase → {id, address}; an older plain id is read as {id, address: null}. */
const elementOf = (state, reason) => {
  if (state !== 'installed' || !reason) return null
  try { const o = JSON.parse(reason); if (o && typeof o.id === 'string') return { id: o.id, address: o.address ?? null } } catch {}
  return { id: reason, address: null }
}

async function startInstall(orderId, slug, again) {
  const a = await core.install(orderId, slug, again)
  const state = a?.ok ? String(a.state ?? 'running') : 'failed'
  const detail = textOf(a?.ok ? detailOf(a) : a?.reason ?? 'no answer')
  const pu = (await R().purchases()).find((x) => x.slug === slug)
  if (pu) await R().putPurchase({ ...pu, install_state: state, install_reason: detail })
  return { state, detail }
}

export async function purchases(_input, caller) {
  const no = personOnly(caller); if (no) return no
  await reconcile()
  const list = await R().purchases()
  // Every purchase not yet «installed» is asked of the core once per read of the page (and so after «Установить»): a failed or never
  // started one may be installed by now (the core answered an order installed before as installed, 2026-11-27). No timer, no polling.
  for (const p of list) {
    if (p.install_state === 'installed') continue
    const live = await core.installState(p.order_id, p.slug).catch(() => null)
    if (!live?.ok || !live.state) continue
    p.install_state = String(live.state); p.install_reason = textOf(detailOf(live))
    await R().putPurchase(p)
  }
  const rows = list.length ? await R().rows() : []
  return {
    status: 200,
    body: {
      purchases: list.map((p) => ({
        about: aboutOf(rows, p.slug),
        starter: p.slug, name: p.name, version: p.tag, author: p.author, page: p.page, time: p.at,
        order: p.order_id,
        install: p.install_state === 'installed'
          ? { state: 'installed', reason: null, element: elementOf('installed', p.install_reason) }
          : { state: p.install_state, reason: p.install_reason },
      })),
    },
  }
}

/** R-05: a bought starter installs again for free — the same order, no new payment. */
export async function reinstall(input, caller) {
  const no = personOnly(caller); if (no) return no
  const slug = text(input?.starter, 200)
  const p = slug && (await R().purchases()).find((x) => x.slug === slug)
  if (!p) return { status: 404, body: { error: 'not_found', reason: 'no such purchase' } }
  // `again` only once it was installed: a purchase whose first install failed or never ran gets its first install.
  return { status: 200, body: { install: await startInstall(p.order_id, p.slug, p.install_state === 'installed') } }
}

// ── The summary for a Telegram remote (step 5): counts only, from this element's own data — no model, no call to the core or the store.
// The node (the core's «Пульт») gets the whole project; `?element=<id>` narrows to that element's tasks; a neighbour gets its own only.
const pagesOf = (lang, element) => ({
  recommendations: `/${lang}/admin/recommendations${element ? `?element=${encodeURIComponent(element)}` : ''}`,
  cart: `/${lang}/admin/cart`,
  bought: `/${lang}/admin/purchases`,
})

export async function summary(input, caller) {
  const own = caller?.kind === 'element' ? caller.id : null
  const asked = text(input?.element, 100)
  if (own && asked && asked !== own) return { status: 403, body: { error: 'not_yours', reason: 'an element sees its own counts only' } }
  const element = own ?? asked ?? null
  const lang = input?.lang === 'en' ? 'en' : 'ru'
  const rows = (await R().rows(element ? { element } : {})).filter((r) => ACTIVE.has(r.status))
  const waiting = rows.filter((r) => r.status === 'waiting').length
  if (element) {
    return { status: 200, body: { element, found: rows.length, waiting, inCart: rows.filter((r) => r.status === 'cart').length, pages: pagesOf(lang, element) } }
  }
  const lines = await R().cart()
  const total = lines.reduce((s, l) => s + Number(l.price_amount), 0)
  const bought = await R().purchases()
  return {
    status: 200,
    body: {
      waiting,
      cart: { lines: lines.length, total: { amount: total, currency: lines[0]?.price_currency ?? 'USD' } },
      bought: { all: bought.length, notInstalled: bought.filter((p) => p.install_state !== 'installed').length },
      pages: pagesOf(lang, null),
    },
  }
}
