import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"
import { getSettings } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const s = await getSettings()
  const pwd = await db.setting.findUnique({ where: { id: "adminPassword" } })
  return NextResponse.json({ settings: { ...s, adminPassword: pwd?.value ?? "" } })
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const b = await req.json()
    const allowed = ["whatsappNumber", "usdRate", "aedRate", "announcement", "sketchfabUrl", "brandName", "brandTagline", "adminPassword"]
    for (const k of allowed) {
      if (b[k] !== undefined && b[k] !== "") {
        const val = String(b[k])
        await db.setting.upsert({ where: { id: k }, create: { id: k, value: val }, update: { value: val } })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
