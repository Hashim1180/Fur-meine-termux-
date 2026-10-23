import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"
import { toMediaDTO } from "@/lib/queries"
import { promises as fs } from "fs"

export const dynamic = "force-dynamic"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await params
    const m = await db.media.findUnique({ where: { id } })
    if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 })
    // remove file from disk if it lives under our media folder
    if (m.path.startsWith("/media/")) {
      const abs = "/home/z/my-project/public" + m.path
      try { await fs.unlink(abs) } catch {}
    }
    await db.media.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await params
    const b = await req.json()
    const data: Record<string, unknown> = {}
    if (b.name !== undefined) data.name = b.name
    if (b.tag !== undefined) data.tag = b.tag
    const row = await db.media.update({ where: { id }, data })
    return NextResponse.json({ media: toMediaDTO(row) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
