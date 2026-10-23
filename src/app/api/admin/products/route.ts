import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"
import { toProductDTO } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await db.product.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
  return NextResponse.json({ products: rows.map(toProductDTO) })
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const b = await req.json()
    const row = await db.product.create({
      data: {
        name: b.name,
        category: b.category ?? "Supplements",
        tagline: b.tagline ?? "",
        description: b.description ?? "",
        pricePKR: Number(b.pricePKR ?? 0),
        badges: Array.isArray(b.badges) ? b.badges.join("|") : b.badges ?? "",
        image: b.image ?? "",
        video: b.video ?? "",
        model3d: b.model3d ?? "",
        featured: !!b.featured,
        inStock: b.inStock ?? true,
        rating: Number(b.rating ?? 5),
        order: Number(b.order ?? 0),
      },
    })
    return NextResponse.json({ product: toProductDTO(row) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
