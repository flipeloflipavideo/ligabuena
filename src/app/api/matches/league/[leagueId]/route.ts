import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    // Check if league exists
    const league = await db.league.findUnique({
      where: { id: params.leagueId }
    })

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    // Get all matches for this league with their related data
    const matches = await db.match.findMany({
      where: { leagueId: params.leagueId },
      include: {
        result: {
          include: {
            goals: true
          }
        }
      }
    })

    if (matches.length === 0) {
      return NextResponse.json({ 
        message: "No matches found for this league",
        deletedCount: 0 
      })
    }

    // Delete all goals for all matches in this league
    const matchResultIds = matches
      .filter(match => match.result)
      .map(match => match.result!.id)

    if (matchResultIds.length > 0) {
      await db.goal.deleteMany({
        where: { matchResultId: { in: matchResultIds } }
      })
    }

    // Delete all match results
    if (matchResultIds.length > 0) {
      await db.matchResult.deleteMany({
        where: { id: { in: matchResultIds } }
      })
    }

    // Delete all matches
    const deletedMatches = await db.match.deleteMany({
      where: { leagueId: params.leagueId }
    })

    return NextResponse.json({ 
      message: "All matches deleted successfully for the league",
      deletedCount: deletedMatches.count,
      leagueId: params.leagueId
    })
  } catch (error) {
    console.error("Error deleting matches for league:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}