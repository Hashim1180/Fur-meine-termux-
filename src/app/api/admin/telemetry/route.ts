import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const [products, events, media, settings] = await Promise.all([
    db.product.count(),
    db.event.count(),
    db.media.count(),
    db.setting.count(),
  ])
  const inventoryValue = await db.product.aggregate({ _sum: { pricePKR: true } })
  const avgRating = await db.product.aggregate({ _avg: { rating: true } })
  const liveEvents = await db.event.count({ where: { archived: false } })
  return NextResponse.json({
    products,
    events,
    liveEvents,
    media,
    settings,
    inventoryValuePKR: inventoryValue._sum.pricePKR ?? 0,
    avgRating: avgRating._avg.rating ?? 0,
    uptime: Date.now(),
  })
}
