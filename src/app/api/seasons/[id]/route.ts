import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const season = await db.season.findUnique({
      where: { id },
      include: {
        leagues: {
          include: {
            teams: {
              include: {
                players: true
              }
            },
            matches: {
              include: {
                homeTeam: true,
                awayTeam: true,
                result: {
                  include: {
                    goals: {
                      include: {
                        player: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        nonSchoolDays: true
      }
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    return NextResponse.json(season)
  } catch (error) {
    console.error("Error fetching season:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if season exists
    const season = await db.season.findUnique({
      where: { id }
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    console.log(`Deleting season ${id} and all related data...`)
    
    // Delete all data in correct order due to foreign key constraints
    // Use deleteMany with direct where clauses to avoid issues with nested data
    
    // Delete goals first (they depend on match results)
    await db.goal.deleteMany({
      where: {
        matchResult: {
          match: {
            league: {
              seasonId: id
            }
          }
        }
      }
    })
    
    // Delete match results (they depend on matches)
    await db.matchResult.deleteMany({
      where: {
        match: {
          league: {
            seasonId: id
          }
        }
      }
    })
    
    // Delete matches (they depend on leagues)
    await db.match.deleteMany({
      where: {
        league: {
          seasonId: id
        }
      }
    })
    
    // Delete players (they depend on teams)
    await db.player.deleteMany({
      where: {
        team: {
          league: {
            seasonId: id
          }
        }
      }
    })
    
    // Delete teams (they depend on leagues)
    await db.team.deleteMany({
      where: {
        league: {
          seasonId: id
        }
      }
    })
    
    // Delete leagues (they depend on seasons)
    await db.league.deleteMany({
      where: {
        seasonId: id
      }
    })
    
    // Delete non-school days (they depend on seasons)
    await db.nonSchoolDay.deleteMany({
      where: {
        seasonId: id
      }
    })
    
    // Finally, delete the season
    await db.season.delete({
      where: { id }
    })

    console.log(`Season ${id} deleted successfully!`)

    return NextResponse.json({ 
      message: "Season and all related data deleted successfully",
      deletedSeason: {
        id: season.id,
        name: season.name
      }
    })
  } catch (error) {
    console.error("Error deleting season:", error)
    return NextResponse.json({ 
      error: "Failed to delete season",
      details: error.message 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive, name, startDate, endDate } = body

    // Check if season exists
    const season = await db.season.findUnique({
      where: { id }
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // If activating this season, deactivate all others
    if (isActive === true) {
      await db.season.updateMany({
        where: {
          id: { not: id },
          isActive: true
        },
        data: {
          isActive: false
        }
      })
    }

    // Update the season
    const updatedSeason = await db.season.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(name && { name }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      },
      include: {
        leagues: {
          include: {
            teams: true
          }
        },
        nonSchoolDays: true
      }
    })

    return NextResponse.json(updatedSeason)
  } catch (error) {
    console.error("Error updating season:", error)
    return NextResponse.json({ 
      error: "Failed to update season",
      details: error.message 
    }, { status: 500 })
  }
}