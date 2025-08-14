import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, teamId } = body

    if (!name || !teamId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if team exists
    const team = await db.team.findUnique({
      where: { id: teamId }
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Create the player
    const player = await db.player.create({
      data: {
        name,
        teamId
      }
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error("Error creating player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}