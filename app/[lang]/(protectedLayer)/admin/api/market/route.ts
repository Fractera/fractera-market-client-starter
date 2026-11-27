// @api the architect's marketplace pages: recommendations, cart, purchases — read and act through lib/market
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import * as market from "@/lib/market/market.mjs"

// The door of the islands «Рекомендации», «Корзина», «Покупки» (step 3). The browser never holds the node key: this door checks the
// architect's session and calls lib/market directly; lib/market reaches the store only through the core's doors with this element's
// own key. A showcase visitor may read the pages' shape, never act (POST refused).
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const PERSON = { kind: "architect" } as const
type Result = { status: number; body: unknown }

async function architect(req: NextRequest, write: boolean): Promise<200 | 401 | 403> {
  const s = await getSession(req)
  if (!s) return 401
  if (!s.roles?.includes("architect")) return 403
  if (write && s.viaShowcase) return 403
  return 200
}

const out = ({ status, body }: Result) => NextResponse.json(body, { status, headers: NO_STORE })

export async function GET(req: NextRequest) {
  const a = await architect(req, false)
  if (a !== 200) return NextResponse.json({ error: "architect_only" }, { status: a, headers: NO_STORE })
  const view = req.nextUrl.searchParams.get("view")
  try {
    if (view === "recommendations") return out(await market.recommendations({}, PERSON))
    if (view === "cart") return out(await market.cart({}, PERSON))
    if (view === "purchases") return out(await market.purchases({}, PERSON))
  } catch (e) {
    return out({ status: 503, body: { error: "unavailable", reason: String((e as Error)?.message ?? e).slice(0, 200) } })
  }
  return out({ status: 400, body: { error: "bad_request", reason: "view: recommendations | cart | purchases" } })
}

export async function POST(req: NextRequest) {
  const a = await architect(req, true)
  if (a !== 200) return NextResponse.json({ error: "architect_only" }, { status: a, headers: NO_STORE })
  let input: Record<string, unknown>
  try {
    input = (await req.json()) as Record<string, unknown>
  } catch {
    return out({ status: 400, body: { error: "bad_request", reason: "the body must be JSON" } })
  }
  const lang = req.nextUrl.pathname.split("/")[1] === "en" ? "en" : "ru"
  try {
    switch (input?.op) {
      // The architect's own search: the asking element is this client itself.
      case "search": return out(await market.recommend({ element: "market", task: input.task, lang }, PERSON))
      case "choice": return out(await market.choice({ row: input.row, action: input.action }, PERSON))
      case "cart": return out(await market.cart({ action: input.action, starter: input.starter }, PERSON))
      // Step 6: the consent ticked on the page goes with the purchase; «check» asks the core whether the waiting order is paid.
      case "get": return out(await market.checkout({ consent: input.consent === true, lang }, PERSON))
      case "check": return out(await market.confirmPayment({ order: input.order }, PERSON))
      case "reinstall": return out(await market.reinstall({ starter: input.starter }, PERSON))
    }
  } catch (e) {
    return out({ status: 503, body: { error: "unavailable", reason: String((e as Error)?.message ?? e).slice(0, 200) } })
  }
  return out({ status: 400, body: { error: "bad_request", reason: "op: search | choice | cart | get | check | reinstall" } })
}
