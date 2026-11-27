// @local — the work of the marketplace client's doors (stage 0): recommend, the list, the choice, the cart, the history.
// R-04: an asking element hears «рекомендовано, ждёт решения человека», never «куплено» before the core confirms the payment.
import { randomUUID } from 'node:crypto'
import { search as storeSearch } from './store.mjs'
import { remoteRepo } from './repo.mjs'

let repo = null
let search = storeSearch
const R = () => (repo ??= remoteRepo())
/** For the tests: another repo or another store. */
export function use({ repo: r, search: s } = {}) { if (r) repo = r; if (s) search = s }

const MAX_ACTIVE = 10 // Q-01 default: active rows per task
const ACTIVE = new Set(['waiting', 'kept', 'cart'])
const SAYS = { ru: 'рекомендовано, ждёт решения человека', en: 'recommended, waiting for the person’s decision' }
const now = () => new Date().toISOString()
const bad = (reason, status = 400) => ({ status, body: { error: 'bad_request', reason } })
const text = (v, max) => (typeof v === 'string' && v.trim().length >= 1 && v.trim().length <= max ? v.trim() : null)
const publicRow = (r) => ({
  id: r.id, task: r.task, element: r.element, starter: r.slug, name: r.name, source: r.source, simulated: r.simulated,
  page: r.page, price: { amount: r.price_amount, currency: r.price_currency }, usefulness: r.usefulness, why: r.why,
  bought: r.bought, status: r.status, time: r.updated_at,
})

async function isBought(slug) {
  return (await R().history()).some((h) => h.slug === slug && h.action === 'bought')
}

export async function recommend(input, caller) {
  const task = text(input?.task, 1000)
  if (!task) return bad('task: 1-1000 characters')
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
  const known = new Set(rows.filter((r) => ACTIVE.has(r.status) || r.status === 'deleted').map((r) => r.slug))
  const rejected = new Set(history.filter((h) => h.action === 'rejected').map((h) => h.starter))
  const added = []
  for (const it of answer.items) {
    if (!it?.slug || known.has(it.slug) || rejected.has(it.slug)) continue
    const row = {
      id: randomUUID(), task, element, slug: it.slug, name: String(it.name ?? it.slug),
      source: answer.mode === 'lagrix' ? 'lagrix' : 'fractera', simulated: answer.mode === 'stub' || answer.mode === 'lagrix',
      page: it.page ?? it.url ?? null, description: it.description ?? null,
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
    if (row.bought || (await isBought(row.slug))) return { status: 409, body: { error: 'already_bought', reason: 'уже куплен — install it again from the purchases' } }
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
  const total = lines.reduce((s, l) => s + Number(l.price_amount), 0)
  return { lines: lines.map((l) => ({ starter: l.slug, name: l.name, price: { amount: l.price_amount, currency: l.price_currency }, added: l.added_at })), total: { amount: total, currency: lines[0]?.price_currency ?? 'USD' } }
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
