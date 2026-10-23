import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"
import { toProductDTO } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await params
    const b = await req.json()
    const data: Record<string, unknown> = {}
    for (const k of ["name", "category", "tagline", "description", "image", "video", "model3d"]) {
      if (b[k] !== undefined) data[k] = b[k]
    }
    if (b.pricePKR !== undefined) data.pricePKR = Number(b.pricePKR)
    if (b.rating !== undefined) data.rating = Number(b.rating)
    if (b.order !== undefined) data.order = Number(b.order)
    if (b.badges !== undefined) data.badges = Array.isArray(b.badges) ? b.badges.join("|") : String(b.badges)
    if (b.featured !== undefined) data.featured = !!b.featured
    if (b.inStock !== undefined) data.inStock = !!b.inStock
    const row = await db.product.update({ where: { id }, data })
    return NextResponse.json({ product: toProductDTO(row) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { id } = await params
    await db.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
