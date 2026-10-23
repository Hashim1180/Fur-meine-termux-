import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { getMedia } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const media = await getMedia()
  return NextResponse.json({ media })
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const tag = (form.get("tag") as string) || "product"
    const name = (form.get("name") as string) || file?.name || "untitled"
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const buf = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split(".").pop() || "bin").toLowerCase()
    const mt = file.type || "application/octet-stream"
    let type: "photo" | "video" | "audio" = "photo"
    if (mt.startsWith("video")) type = "video"
    else if (mt.startsWith("audio")) type = "audio"
    else if (mt.startsWith("image")) type = "photo"

    const dir = type === "audio" ? "audio" : type === "video" ? "videos" : "photos"
    const safeName = name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 40) + "-" + Date.now() + "." + ext
    const path = `/media/${dir}/${safeName}`
    const fs = await import("fs/promises")
    const abs = "/home/z/my-project/public" + path
    await fs.mkdir("/home/z/my-project/public/media/" + dir, { recursive: true })
    await fs.writeFile(abs, buf)

    const { db } = await import("@/lib/db")
    const row = await db.media.create({
      data: { type, name, path, mime: mt, size: buf.length, tag },
    })
    return NextResponse.json({ media: row })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
