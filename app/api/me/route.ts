// @api tell the browser who is signed in and with which roles
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/get-session"
import { withSiblingCors } from "@/lib/sibling-origin"

// 🔒 СОСЕДНИЕ ЭЛЕМЕНТЫ УЗЛА ЧИТАЮТ ОТВЕТ (шаг 312): шапка элементов на `<id>.<зона>` спрашивает эту дверь из браузера —
// своей двери «кто вошёл» у них нет. Кто считается своим — `lib/sibling-origin.ts` (одно правило на все такие двери).
export async function GET(req: NextRequest) {
  const session = await getSession(req)
  // A guest is an answer, not an error (market step 7-1): 401 here printed two red lines in every visitor's console on a public page.
  // Every caller reads a guest the same way — no `userId`, no roles; a lock still asks the server, never this answer.
  if (!session) return withSiblingCors(req, NextResponse.json({ userId: null, roles: [] }))
  return withSiblingCors(req, NextResponse.json(session))
}
