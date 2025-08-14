import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const leagues = await db.league.findMany({
      include: {
        teams: {
          orderBy: { name: 'asc' }
        },
        season: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(leagues)
  } catch (error) {
    console.error("Error fetching leagues:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, season, teamCount } = body

    if (!name || !category || !season || !teamCount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find the season
    const seasonData = await db.season.findFirst({
      where: { name: season }
    })

    if (!seasonData) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Create the league
    const league = await db.league.create({
      data: {
        name,
        sport: "BASKETBALL",
        category: "CATEGORY_3_4",
        seasonId: seasonData.id
      }
    })

    // Create teams for the league
    const teams = []
    for (let i = 1; i <= teamCount; i++) {
      const team = await db.team.create({
        data: {
          name: `Equipo ${i}`,
          leagueId: league.id
        }
      })
      teams.push(team)
    }

    // Return the created league with teams
    const createdLeague = await db.league.findUnique({
      where: { id: league.id },
      include: {
        teams: {
          orderBy: { name: 'asc' }
        },
        season: true
      }
    })

    return NextResponse.json(createdLeague)
  } catch (error) {
    console.error("Error creating league:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    // Delete all matches first (due to foreign key constraints)
    await db.match.deleteMany({})
    
    // Delete all teams
    await db.team.deleteMany({})
    
    // Delete all leagues
    await db.league.deleteMany({})

    return NextResponse.json({ message: "All leagues deleted successfully" })
  } catch (error) {
    console.error("Error deleting leagues:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}