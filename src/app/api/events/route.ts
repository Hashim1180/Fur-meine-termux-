import { NextResponse } from "next/server"
import { getEvents } from "@/lib/queries"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const events = await getEvents()
    return NextResponse.json({ events })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
