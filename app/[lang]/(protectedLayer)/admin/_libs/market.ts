// @local — the shapes and the small formatting the three marketplace pages of this branch share (step 3): recommendations,
// cart, purchases. No markup, no secrets: the client islands import it. The shapes mirror the answers of lib/market/market.mjs.

export type Money = { amount: number; currency: string }

export type RecommendationRow = {
  id: string
  task: string
  element: string
  starter: string
  name: string
  source: "fractera" | "lagrix" | string
  /** Lagrix and the stub are simulated today — the row says so (S-03). */
  simulated: boolean
  page: string | null
  price: Money
  usefulness: number
  /** The store's `whyFits`, kept as JSON text. */
  why: string
  bought: boolean
  status: "waiting" | "kept" | "cart"
  time: string
  author?: string
  /** The store's description of the starter: what it can do. */
  description?: string
  /** The version the store researched, and its research report. */
  version?: string
  report?: string | null
}

export type TaskGroup = { task: string; rows: RecommendationRow[] }

/** `about` — what the store said of the starter, from its latest recommendation (the card, step 4-4). */
export type CartLine = { starter: string; name: string; price: Money; added: string; about?: RecommendationRow | null }
export type CartData = { lines: CartLine[]; total: Money }

export type Install = { state: string; reason: string | null; element?: { id: string; address: string | null } | null }
export type Purchase = {
  starter: string
  name: string
  version: string
  author: string
  page: string | null
  time: string
  install?: Install
  about?: RecommendationRow | null
}

/** The one address of this branch's marketplace door — the islands call it only through here. */
export const marketDoor = (lang: string) => `/${lang}/admin/api/market`

export type DoorAnswer<T> = { ok: true; status: number; body: T } | { ok: false; status: number; reason: string }

/** A call of the door: GET with `view`, or POST with an `op`. Never throws — a failure is an answer with its reason. */
export async function marketCall<T>(lang: string, what: { view: string; op?: never } | { op: string; view?: never; [k: string]: unknown }): Promise<DoorAnswer<T>> {
  try {
    const r =
      typeof what.view === "string"
        ? await fetch(`${marketDoor(lang)}?view=${encodeURIComponent(what.view)}`, { cache: "no-store" })
        : await fetch(marketDoor(lang), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(what) })
    const body = (await r.json().catch(() => null)) as (T & { reason?: string; error?: string }) | null
    if (r.ok && body) return { ok: true, status: r.status, body }
    return { ok: false, status: r.status, reason: body?.reason ?? body?.error ?? `HTTP ${r.status}` }
  } catch (e) {
    return { ok: false, status: 0, reason: String((e as Error)?.message ?? e) }
  }
}

export function money(p: Money, lang: string, free: string): string {
  if (!p.amount) return free
  try {
    return new Intl.NumberFormat(lang, { style: "currency", currency: p.currency || "USD" }).format(p.amount)
  } catch {
    return `${p.amount} ${p.currency}`
  }
}

export function when(iso: string, lang: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(lang, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

/** The store's reason in one line: `whyFits` carries `why` (search v2), older answers `reason`, `text` or `summary`. */
export function whyText(why: string): string {
  try {
    const w = JSON.parse(why) as Record<string, unknown>
    const t = w.why ?? w.reason ?? w.text ?? w.summary
    return typeof t === "string" ? t : ""
  } catch {
    return ""
  }
}

/** The row indexes ordered by price; equal prices keep the list's own order in both directions (step 4-2). */
export function priceOrder(prices: Money[], dir: 1 | -1): number[] {
  return prices.map((_, i) => i).sort((a, b) => dir * (prices[a].amount - prices[b].amount) || a - b)
}

/** The author is Fractera itself — the filter «От Fractera» of the marketplace tables. */
export const byFractera = (author?: string | null) => (author ?? "").trim().toLowerCase() === "fractera"
