import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { destroySession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const token = (await cookies()).get("aw_admin")?.value
    await destroySession(token)
    const res = NextResponse.json({ ok: true })
    res.cookies.delete("aw_admin")
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
