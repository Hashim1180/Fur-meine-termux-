import { NextResponse } from "next/server"
import { getMedia } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const media = await getMedia()
    return NextResponse.json({ media })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
