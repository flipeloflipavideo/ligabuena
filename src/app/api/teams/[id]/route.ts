import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if team exists
    const existingTeam = await db.team.findUnique({
      where: { id: params.id }
    })

    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if new name already exists in this league
    if (name !== existingTeam.name) {
      const nameExists = await db.team.findFirst({
        where: {
          name,
          leagueId: existingTeam.leagueId,
          NOT: {
            id: params.id
          }
        }
      })

      if (nameExists) {
        return NextResponse.json({ error: "Team name already exists in this league" }, { status: 400 })
      }
    }

    // Update the team
    const team = await db.team.update({
      where: { id: params.id },
      data: { name },
      include: {
        players: true
      }
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if team exists
    const team = await db.team.findUnique({
      where: { id: params.id },
      include: {
        matches: true
      }
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Check if team has matches
    if (team.homeMatches.length > 0 || team.awayMatches.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete team that has matches scheduled" 
      }, { status: 400 })
    }

    // Delete the team (this will also delete players due to cascade)
    await db.team.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}