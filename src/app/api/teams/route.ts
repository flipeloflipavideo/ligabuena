import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, leagueId } = body

    if (!name || !leagueId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if league exists
    const league = await db.league.findUnique({
      where: { id: leagueId }
    })

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    // Check if team name already exists in this league
    const existingTeam = await db.team.findFirst({
      where: {
        name,
        leagueId
      }
    })

    if (existingTeam) {
      return NextResponse.json({ error: "Team name already exists in this league" }, { status: 400 })
    }

    // Create the team
    const team = await db.team.create({
      data: {
        name,
        leagueId
      },
      include: {
        players: true
      }
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}