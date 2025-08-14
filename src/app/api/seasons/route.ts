import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const seasons = await db.season.findMany({
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
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json(seasons)
  } catch (error) {
    console.error("Error fetching seasons:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, startDate, endDate } = body

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Deactivate all existing seasons before creating a new one
    await db.season.updateMany({
      where: {
        isActive: true
      },
      data: {
        isActive: false
      }
    })

    // Create the season
    const season = await db.season.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true
      }
    })

    // Create the 6 base leagues
    const leagues = await Promise.all([
      // Football leagues
      db.league.create({
        data: {
          name: "Fútbol 1-2",
          sport: "FOOTBALL",
          category: "CATEGORY_1_2",
          seasonId: season.id
        }
      }),
      db.league.create({
        data: {
          name: "Fútbol 3-4",
          sport: "FOOTBALL",
          category: "CATEGORY_3_4",
          seasonId: season.id
        }
      }),
      db.league.create({
        data: {
          name: "Fútbol 5-6",
          sport: "FOOTBALL",
          category: "CATEGORY_5_6",
          seasonId: season.id
        }
      }),
      // Basketball leagues
      db.league.create({
        data: {
          name: "Baloncesto 1-2",
          sport: "BASKETBALL",
          category: "CATEGORY_1_2",
          seasonId: season.id
        }
      }),
      db.league.create({
        data: {
          name: "Baloncesto 3-4",
          sport: "BASKETBALL",
          category: "CATEGORY_3_4",
          seasonId: season.id
        }
      }),
      db.league.create({
        data: {
          name: "Baloncesto 5-6",
          sport: "BASKETBALL",
          category: "CATEGORY_5_6",
          seasonId: season.id
        }
      })
    ])

    // Create some default non-school days (Mexican school calendar)
    const nonSchoolDays = await Promise.all([
      // Christmas vacation
      db.nonSchoolDay.create({
        data: {
          date: new Date(`${new Date().getFullYear()}-12-20`),
          description: "Inicio de Vacaciones de Navidad",
          seasonId: season.id
        }
      }),
      db.nonSchoolDay.create({
        data: {
          date: new Date(`${new Date().getFullYear() + 1}-01-07`),
          description: "Fin de Vacaciones de Navidad",
          seasonId: season.id
        }
      }),
      // Easter week (approximate)
      db.nonSchoolDay.create({
        data: {
          date: new Date(`${new Date().getFullYear() + 1}-03-24`),
          description: "Semana Santa",
          seasonId: season.id
        }
      }),
      db.nonSchoolDay.create({
        data: {
          date: new Date(`${new Date().getFullYear() + 1}-03-31`),
          description: "Semana Santa",
          seasonId: season.id
        }
      })
    ])

    // Return the complete season with all related data
    const completeSeason = await db.season.findUnique({
      where: { id: season.id },
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

    return NextResponse.json(completeSeason)
  } catch (error) {
    console.error("Error creating season:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}