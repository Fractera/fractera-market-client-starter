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
}

export type TaskGroup = { task: string; rows: RecommendationRow[] }

export type CartLine = { starter: string; name: string; price: Money; added: string }
export type CartData = { lines: CartLine[]; total: Money }

export type Purchase = { starter: string; name: string; version: string; author: string; page: string | null; time: string }

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

/** The store's reason in one line: `whyFits` may carry `reason`, `text` or `summary`. */
export function whyText(why: string): string {
  try {
    const w = JSON.parse(why) as Record<string, unknown>
    const t = w.reason ?? w.text ?? w.summary
    return typeof t === "string" ? t : ""
  } catch {
    return ""
  }
}
