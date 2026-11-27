// @local — where the marketplace client keeps its rows: recommendations (E-01), cart lines (E-02), the history of choices (E-03).
// Two backends with one interface: `remoteRepo()` — this element's own space of the node's data element (SQL over /db/migrate,
// the key from storeHeaders); `memoryRepo()` — the same in memory, for the door tests.
import { serviceUrlFor } from '../microservices/urls.mjs'
import { storeHeaders } from '../fractera/store-key.mjs'

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS market_recommendations (
    id TEXT PRIMARY KEY NOT NULL, task TEXT NOT NULL, element TEXT NOT NULL, slug TEXT NOT NULL, name TEXT NOT NULL,
    source TEXT NOT NULL, simulated INTEGER NOT NULL DEFAULT 0, page TEXT, description TEXT,
    price_amount REAL NOT NULL DEFAULT 0, price_currency TEXT NOT NULL DEFAULT 'USD', usefulness REAL, why TEXT,
    bought INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS market_recommendations_task ON market_recommendations (task, status)`,
  `CREATE TABLE IF NOT EXISTS market_cart (
    slug TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, price_amount REAL NOT NULL DEFAULT 0,
    price_currency TEXT NOT NULL DEFAULT 'USD', added_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS market_history (
    task TEXT NOT NULL, slug TEXT NOT NULL, action TEXT NOT NULL, at TEXT NOT NULL, PRIMARY KEY (task, slug))`,
  `CREATE TABLE IF NOT EXISTS market_purchases (
    slug TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, tag TEXT, author TEXT, page TEXT, order_id TEXT NOT NULL, at TEXT NOT NULL,
    install_state TEXT, install_reason TEXT)`,
]
// Columns added after the first tables were made: ALTER fails once the column exists, and that failure is the «already there».
const LATER = [`ALTER TABLE market_recommendations ADD COLUMN author TEXT`, `ALTER TABLE market_recommendations ADD COLUMN version TEXT`,
  `ALTER TABLE market_recommendations ADD COLUMN report TEXT`]
const PU_COLS = ['slug', 'name', 'tag', 'author', 'page', 'order_id', 'at', 'install_state', 'install_reason']

const REC_COLS = ['id', 'task', 'element', 'slug', 'name', 'source', 'simulated', 'page', 'description', 'price_amount',
  'price_currency', 'usefulness', 'why', 'bought', 'status', 'created_at', 'updated_at', 'author', 'version', 'report']

export function remoteRepo() {
  let ready = null
  async function sql(query, params = []) {
    const url = serviceUrlFor('data')
    if (!url) throw new Error('no data element address')
    const res = await fetch(`${url}/db/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...storeHeaders() },
      body: JSON.stringify({ sql: query, params }),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`data element ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return (await res.json()).rows ?? []
  }
  async function q(query, params) {
    ready ??= (async () => { for (const s of SCHEMA) await sql(s); for (const s of LATER) await sql(s).catch(() => {}) })().catch((e) => { ready = null; throw e })
    await ready
    return sql(query, params)
  }
  const toRec = (r) => r && { ...r, simulated: !!r.simulated, bought: !!r.bought }
  return {
    async rows({ task, element } = {}) {
      const where = []; const p = []
      if (task) { where.push('task = ?'); p.push(task) }
      if (element) { where.push('element = ?'); p.push(element) }
      const rows = await q(`SELECT * FROM market_recommendations${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY created_at`, p)
      return rows.map(toRec)
    },
    async getRow(id) { return toRec((await q('SELECT * FROM market_recommendations WHERE id = ?', [id]))[0] ?? null) },
    async putRow(r) {
      const v = REC_COLS.map((c) => (typeof r[c] === 'boolean' ? (r[c] ? 1 : 0) : r[c] ?? null))
      await q(`INSERT OR REPLACE INTO market_recommendations (${REC_COLS.join(',')}) VALUES (${REC_COLS.map(() => '?').join(',')})`, v)
    },
    async history(task) {
      return task ? q('SELECT * FROM market_history WHERE task = ? ORDER BY at', [task]) : q('SELECT * FROM market_history ORDER BY at')
    },
    async putHistory(h) { await q('INSERT OR REPLACE INTO market_history (task, slug, action, at) VALUES (?,?,?,?)', [h.task, h.slug, h.action, h.at]) },
    async cart() { return q('SELECT * FROM market_cart ORDER BY added_at') },
    async addCart(l) {
      await q('INSERT OR IGNORE INTO market_cart (slug, name, price_amount, price_currency, added_at) VALUES (?,?,?,?,?)',
        [l.slug, l.name, l.price_amount, l.price_currency, l.added_at])
    },
    async removeCart(slug) { await q('DELETE FROM market_cart WHERE slug = ?', [slug]) },
    async clearCart() { await q('DELETE FROM market_cart') },
    async purchases() { return q('SELECT * FROM market_purchases ORDER BY at DESC') },
    async putPurchase(p) {
      await q(`INSERT OR REPLACE INTO market_purchases (${PU_COLS.join(',')}) VALUES (${PU_COLS.map(() => '?').join(',')})`, PU_COLS.map((c) => p[c] ?? null))
    },
  }
}

export function memoryRepo() {
  const recs = new Map(); const hist = new Map(); const cart = new Map(); const bought = new Map()
  return {
    async rows({ task, element } = {}) {
      return [...recs.values()].filter((r) => (!task || r.task === task) && (!element || r.element === element))
    },
    async getRow(id) { return recs.get(id) ?? null },
    async putRow(r) { recs.set(r.id, { ...r }) },
    async history(task) { return [...hist.values()].filter((h) => !task || h.task === task) },
    async putHistory(h) { hist.set(`${h.task}\u0000${h.slug}`, { ...h }) },
    async cart() { return [...cart.values()] },
    async addCart(l) { if (!cart.has(l.slug)) cart.set(l.slug, { ...l }) },
    async removeCart(slug) { cart.delete(slug) },
    async clearCart() { cart.clear() },
    async purchases() { return [...bought.values()].reverse() },
    async putPurchase(p) { bought.set(p.slug, { ...p }) },
  }
}
