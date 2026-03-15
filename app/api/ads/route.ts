import { NextRequest, NextResponse } from "next/server"
import { getAds } from "@/lib/api/services/dashboard"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const date_from = searchParams.get("date_from")
    const date_to = searchParams.get("date_to")
    const source = searchParams.get("source") ?? undefined
    const copy = searchParams.get("copy") ?? undefined
    const player_id = searchParams.get("player_id") ?? undefined

    if (!date_from || !date_to) {
      return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 })
    }

    const data = await getAds({ date_from, date_to, source, copy, player_id })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Ads error:", error)
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 })
  }
}
