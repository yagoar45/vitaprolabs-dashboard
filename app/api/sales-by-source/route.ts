import { NextRequest, NextResponse } from "next/server"
import { getSalesBySource } from "@/lib/api/services/dashboard"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const date_from = searchParams.get("date_from")
    const date_to = searchParams.get("date_to")

    if (!date_from || !date_to) {
      return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 })
    }

    const data = await getSalesBySource({ date_from, date_to })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Sales by source error:", error)
    return NextResponse.json({ error: "Failed to fetch sales by source" }, { status: 500 })
  }
}
