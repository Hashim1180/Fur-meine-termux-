import { NextResponse } from "next/server"
import { getSettings } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const s = await getSettings()
    return NextResponse.json({ settings: s })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
