import { NextRequest, NextResponse } from "next/server"
import { getCampaigns } from "@/lib/api/services/dashboard"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const date_from = searchParams.get("date_from")
    const date_to = searchParams.get("date_to")
    const status = searchParams.get("status")
    const campaign_ids = searchParams.get("campaign_ids") ?? undefined
    const page = searchParams.get("page")
    const per = searchParams.get("per")

    if (!date_from || !date_to) {
      return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 })
    }

    const data = await getCampaigns({
      date_from,
      date_to,
      status: status ? (Number(status) as 1 | 2 | 3) : undefined,
      campaign_ids,
      page: page ? Number(page) : undefined,
      per: per ? Number(per) : undefined,
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error("Campaigns error:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}
