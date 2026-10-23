import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"
import { toEventDTO } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await params
    const b = await req.json()
    const data: Record<string, unknown> = {}
    for (const k of ["title", "subtitle", "description", "location", "accent"]) {
      if (b[k] !== undefined) data[k] = b[k]
    }
    for (const k of ["capacity", "enrolled", "durationDays", "order"]) {
      if (b[k] !== undefined) data[k] = Number(b[k])
    }
    if (b.startDate !== undefined) data.startDate = new Date(b.startDate)
    if (b.endDate !== undefined) data.endDate = new Date(b.endDate)
    if (b.archived !== undefined) data.archived = !!b.archived
    const row = await db.event.update({ where: { id }, data })
    return NextResponse.json({ event: toEventDTO(row) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await params
    await db.event.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
