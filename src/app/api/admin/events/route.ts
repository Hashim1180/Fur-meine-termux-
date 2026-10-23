import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"
import { toEventDTO } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await db.event.findMany({ orderBy: [{ archived: "asc" }, { order: "asc" }, { startDate: "asc" }] })
  return NextResponse.json({ events: rows.map(toEventDTO) })
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const b = await req.json()
    const row = await db.event.create({
      data: {
        title: b.title,
        subtitle: b.subtitle ?? "",
        description: b.description ?? "",
        location: b.location ?? "Lahore · Gulberg Flagship",
        capacity: Number(b.capacity ?? 20),
        enrolled: Number(b.enrolled ?? 0),
        durationDays: Number(b.durationDays ?? 15),
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate ?? new Date(new Date(b.startDate).getTime() + (Number(b.durationDays ?? 15)) * 86400000)),
        accent: b.accent ?? "neon",
        archived: !!b.archived,
        order: Number(b.order ?? 0),
      },
    })
    return NextResponse.json({ event: toEventDTO(row) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
