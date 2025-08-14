import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, teamId } = body

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if player exists
    const existingPlayer = await db.player.findUnique({
      where: { id: params.id }
    })

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // If changing team, check if new team exists
    if (teamId && teamId !== existingPlayer.teamId) {
      const team = await db.team.findUnique({
        where: { id: teamId }
      })

      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 })
      }
    }

    // Update the player
    const player = await db.player.update({
      where: { id: params.id },
      data: {
        name,
        ...(teamId && { teamId })
      }
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error("Error updating player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if player exists
    const player = await db.player.findUnique({
      where: { id: params.id },
      include: {
        goals: true
      }
    })

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Check if player has goals
    if (player.goals.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete player that has registered goals" 
      }, { status: 400 })
    }

    // Delete the player
    await db.player.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Player deleted successfully" })
  } catch (error) {
    console.error("Error deleting player:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}