import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

// Bulk sync: accepts CSV/TSV text (or JSON array) of products and upserts by name.
// Columns recognised: name, category, tagline, description, pricePKR (or price), badges (pipe or comma), image, video, rating
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const ct = req.headers.get("content-type") || ""
    let rows: any[] = []
    if (ct.includes("application/json")) {
      rows = await req.json()
      if (!Array.isArray(rows)) return NextResponse.json({ error: "Expected JSON array" }, { status: 400 })
    } else {
      const text = await req.text()
      rows = parseCsv(text)
    }
    let created = 0, updated = 0, skipped = 0
    for (const r of rows) {
      const name = String(r.name || "").trim()
      if (!name) { skipped++; continue }
      const pricePKR = Number(r.pricePKR ?? r.price ?? 0)
      const existing = await db.product.findFirst({ where: { name } })
      const data = {
        category: String(r.category || "Supplements"),
        tagline: String(r.tagline || ""),
        description: String(r.description || ""),
        pricePKR: isNaN(pricePKR) ? 0 : pricePKR,
        badges: Array.isArray(r.badges) ? r.badges.join("|") : String(r.badges || "").replace(/,/g, "|"),
        image: String(r.image || ""),
        video: String(r.video || ""),
        rating: Number(r.rating || 5),
      }
      if (existing) {
        await db.product.update({ where: { id: existing.id }, data: { ...data, inStock: existing.inStock, featured: existing.featured, order: existing.order } })
        updated++
      } else {
        await db.product.create({ data: { ...data, name, order: 99 } })
        created++
      }
    }
    return NextResponse.json({ created, updated, skipped, total: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function parseCsv(text: string): any[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const delim = lines[0].includes("\t") ? "\t" : ","
  const headers = splitLine(lines[0], delim)
  const out: any[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], delim)
    const obj: any = {}
    headers.forEach((h, idx) => { obj[h.trim()] = (cells[idx] ?? "").trim() })
    out.push(obj)
  }
  return out
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = []
  let cur = "", inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { inQ = !inQ; continue }
    if (c === delim && !inQ) { out.push(cur); cur = ""; continue }
    cur += c
  }
  out.push(cur)
  return out
}
