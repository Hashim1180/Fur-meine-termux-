import { NextResponse } from "next/server"
import { verifyPassword, createSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 })
    const ok = await verifyPassword(password)
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    const token = await createSession()
    const res = NextResponse.json({ ok: true })
    res.cookies.set("aw_admin", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
