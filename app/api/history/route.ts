// @api The history of choices by task: rejected, kept, bought
import { NextRequest, NextResponse } from "next/server"
import { needNodeKey, nodeCaller, NO_STORE } from "@/lib/node-key"
import { handle } from "./history.mjs"

// DOOR history — made by `npm run door:add` (node step 548-16). The other elements of the node call it on the machine's loopback
// (http://127.0.0.1:<port>/api/history) with the header X-Node-Key — their code through `neighbourFetch` (lib/neighbour.mjs); the gate
// of proxy.ts lets the loopback through, the key decides here and names the caller (818-7). The work is `handle()` in ./history.mjs —
// this file only checks the key and turns JSON in and out.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const caller = nodeCaller(req.headers.get("x-node-key"))
  if (!caller) return needNodeKey()
  const input = Object.fromEntries(req.nextUrl.searchParams)
  const { status, body } = await handle(input, caller)
  return NextResponse.json(body, { status, headers: NO_STORE })
}
