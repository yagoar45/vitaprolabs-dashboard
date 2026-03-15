import { NextResponse } from "next/server"
import { getVTurbPlayers } from "@/lib/api/services/dashboard"

export async function GET() {
  try {
    const players = await getVTurbPlayers()
    return NextResponse.json(players)
  } catch (error) {
    console.error("VTurb players error:", error)
    return NextResponse.json({ error: "Failed to fetch VTurb players" }, { status: 500 })
  }
}
