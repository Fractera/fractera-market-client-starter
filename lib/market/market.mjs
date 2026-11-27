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
  const lines = await R().cart()
  const rows = lines.length ? await R().rows() : []
  const total = lines.reduce((s, l) => s + Number(l.price_amount), 0)
  return {
    lines: lines.map((l) => ({ starter: l.slug, name: l.name, price: { amount: l.price_amount, currency: l.price_currency }, added: l.added_at, about: aboutOf(rows, l.slug) })),
    total: { amount: total, currency: lines[0]?.price_currency ?? 'USD' },
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

export async function checkout(_input, caller) {
  const no = personOnly(caller); if (no) return no
  const lines = await R().cart()
  if (!lines.length) return bad('the cart is empty')
  if (lines.some((l) => Number(l.price_amount) > 0)) {
    return { status: 402, body: { error: 'payment_hidden', reason: 'only a free cart can be got here for now' } }
  }
  const p = await core.purchase(lines.map((l) => l.slug))
  if (!p?.ok) return { status: 502, body: { error: 'core_refused', reason: p?.reason ?? 'no answer' } }
  // A new order answers `paid` with its id; a starter this project already ordered answers `already-ordered` with the old order on
  // each item (R-05: one copy per buyer, no second payment) — both go on the same way, through the core's own word on that order.
  const orders = isPaidState(p) && p.order ? [p.order]
    : p.state === 'already-ordered' ? [...new Set((p.items ?? []).map((i) => i?.order).filter(Boolean))] : []
  if (!orders.length) return { status: 202, body: { state: p.state ?? 'pending', order: p.order ?? null } }
  const rows = await R().rows()
  const done = []
  const installs = []
  for (const id of orders) {
    const o = await core.order(id)
    if (!isPaidState(o)) continue
    for (const it of o.items ?? []) {
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
      done.push(it.slug)
      installs.push({ order: id, slug: it.slug, ...(await startInstall(id, it.slug, false)) })
    }
  }
  if (!done.length) return { status: 202, body: { state: 'pending', order: orders[0] } }
  return { status: 200, body: { state: 'paid', orders, items: done, install: installs } }
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

const SETTLED = new Set(['installed', 'failed'])

export async function purchases(_input, caller) {
  const no = personOnly(caller); if (no) return no
  const list = await R().purchases()
  // An install still running is asked of the core once per read of the page — no timer, no polling here.
  for (const p of list) {
    if (SETTLED.has(p.install_state) || p.install_state === 'none') continue
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
