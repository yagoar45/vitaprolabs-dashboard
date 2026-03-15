import { NextRequest, NextResponse } from "next/server"
import { getSalesByCountry } from "@/lib/api/services/dashboard"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const date_from = searchParams.get("date_from")
    const date_to = searchParams.get("date_to")

    if (!date_from || !date_to) {
      return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 })
    }

    const data = await getSalesByCountry({ date_from, date_to })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Sales by country error:", error)
    return NextResponse.json({ error: "Failed to fetch sales by country" }, { status: 500 })
  }
}
