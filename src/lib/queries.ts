import { db } from "./db"
import type { ProductDTO, EventDTO, MediaDTO, SettingsDTO } from "./types"

export function toProductDTO(p: any): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    tagline: p.tagline,
    description: p.description,
    pricePKR: p.pricePKR,
    badges: p.badges ? p.badges.split("|").filter(Boolean) : [],
    image: p.image,
    video: p.video,
    model3d: p.model3d,
    featured: !!p.featured,
    inStock: !!p.inStock,
    rating: p.rating,
    order: p.order,
  }
}

export async function getProducts(): Promise<ProductDTO[]> {
  const rows = await db.product.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
  return rows.map(toProductDTO)
}

export function toEventDTO(e: any): EventDTO {
  return {
    id: e.id,
    title: e.title,
    subtitle: e.subtitle,
    description: e.description,
    location: e.location,
    capacity: e.capacity,
    enrolled: e.enrolled,
    durationDays: e.durationDays,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    accent: e.accent,
    archived: !!e.archived,
    order: e.order,
  }
}

export async function getEvents(): Promise<EventDTO[]> {
  // Auto-archive any whose countdown hit zero
  const now = new Date()
  const expired = await db.event.findMany({ where: { endDate: { lt: now }, archived: false } })
  if (expired.length) {
    await db.event.updateMany({
      where: { id: { in: expired.map((e) => e.id) } },
      data: { archived: true },
    })
  }
  const rows = await db.event.findMany({ orderBy: [{ archived: "asc" }, { order: "asc" }, { startDate: "asc" }] })
  return rows.map(toEventDTO)
}

export function toMediaDTO(m: any): MediaDTO {
  return {
    id: m.id,
    type: m.type,
    name: m.name,
    path: m.path,
    mime: m.mime,
    size: m.size,
    tag: m.tag,
    createdAt: m.createdAt.toISOString(),
  }
}

export async function getMedia(): Promise<MediaDTO[]> {
  const rows = await db.media.findMany({ orderBy: { createdAt: "desc" } })
  return rows.map(toMediaDTO)
}

export async function getSettings(): Promise<SettingsDTO> {
  const rows = await db.setting.findMany()
  const map: Record<string, string> = {}
  for (const r of rows) map[r.id] = r.value
  return {
    whatsappNumber: map.whatsappNumber ?? "+923497814918",
    usdRate: parseFloat(map.usdRate ?? "278"),
    aedRate: parseFloat(map.aedRate ?? "75.6"),
    announcement: map.announcement ?? "",
    sketchfabUrl: map.sketchfabUrl ?? "https://sketchfab.com/models/fbd1baf5f56743e6bd4299ad91473b9a/embed",
    brandName: map.brandName ?? "AW GYMS",
    brandTagline: map.brandTagline ?? "THERE IS NO SHORTCUT",
  }
}
