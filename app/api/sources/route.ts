import { NextResponse } from "next/server"
import { getAvailableSources } from "@/lib/api/services/dashboard"

export async function GET() {
  try {
    const sources = await getAvailableSources()
    return NextResponse.json(sources)
  } catch (error) {
    console.error("Sources error:", error)
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 })
  }
}
