// @api Keep, delete or put a recommended starter in the cart
import { NextRequest, NextResponse } from "next/server"
import { needNodeKey, nodeCaller, NO_STORE } from "@/lib/node-key"
import { handle } from "./choice.mjs"

// DOOR choice — made by `npm run door:add` (node step 548-16). The other elements of the node call it on the machine's loopback
// (http://127.0.0.1:<port>/api/choice) with the header X-Node-Key — their code through `neighbourFetch` (lib/neighbour.mjs); the gate
// of proxy.ts lets the loopback through, the key decides here and names the caller (818-7). The work is `handle()` in ./choice.mjs —
// this file only checks the key and turns JSON in and out.
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const caller = nodeCaller(req.headers.get("x-node-key"))
  if (!caller) return needNodeKey()
  let input: unknown
  try { input = await req.json() } catch {
    return NextResponse.json({ error: "bad_request", reason: "the body must be JSON" }, { status: 400, headers: NO_STORE })
  }
  const { status, body } = await handle(input, caller)
  return NextResponse.json(body, { status, headers: NO_STORE })
}
