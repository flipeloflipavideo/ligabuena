import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface TeamStanding {
  id: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

interface TopScorer {
  id: string
  name: string
  team: string
  goals: number
}

interface LeagueStandings {
  category: string
  standings: TeamStanding[]
  topScorers: TopScorer[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport') // 'football' or 'basketball'

    if (!sport || !['football', 'basketball'].includes(sport)) {
      return NextResponse.json({ error: "Invalid sport parameter" }, { status: 400 })
    }

    // Get active season
    const activeSeason = await db.season.findFirst({
      where: { isActive: true },
      include: {
        leagues: {
          where: {
            sport: sport.toUpperCase() as 'FOOTBALL' | 'BASKETBALL'
          },
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
        }
      }
    })

    if (!activeSeason) {
      return NextResponse.json({ error: "No active season found" }, { status: 404 })
    }

    const standings: LeagueStandings[] = []

    // Process each league
    for (const league of activeSeason.leagues) {
      // Initialize team statistics
      const teamStats = new Map<string, TeamStanding>()
      
      league.teams.forEach(team => {
        teamStats.set(team.id, {
          id: team.id,
          name: team.name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        })
      })

      // Process completed matches
      const completedMatches = league.matches.filter(match => match.isCompleted && match.result)
      
      for (const match of completedMatches) {
        if (!match.result) continue

        const homeStats = teamStats.get(match.homeTeamId)!
        const awayStats = teamStats.get(match.awayTeamId)!

        // Update matches played
        homeStats.played++
        awayStats.played++

        // Update goals
        homeStats.goalsFor += match.result.homeScore
        homeStats.goalsAgainst += match.result.awayScore
        awayStats.goalsFor += match.result.awayScore
        awayStats.goalsAgainst += match.result.homeScore

        // Update points based on result
        if (match.result.homeScore > match.result.awayScore) {
          homeStats.won++
          homeStats.points += 2
          awayStats.lost++
        } else if (match.result.homeScore < match.result.awayScore) {
          awayStats.won++
          awayStats.points += 2
          homeStats.lost++
        } else {
          homeStats.drawn++
          awayStats.drawn++
          homeStats.points += 1
          awayStats.points += 1
        }
      }

      // Sort teams by points (descending), then by goal difference
      const sortedStandings = Array.from(teamStats.values()).sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points
        }
        const goalDiffA = a.goalsFor - a.goalsAgainst
        const goalDiffB = b.goalsFor - b.goalsAgainst
        return goalDiffB - goalDiffA
      })

      // Calculate top scorers
      const playerGoals = new Map<string, { name: string; team: string; goals: number }>()
      
      // Initialize all players
      for (const team of league.teams) {
        for (const player of team.players) {
          playerGoals.set(player.id, {
            name: player.name,
            team: team.name,
            goals: 0
          })
        }
      }

      // Count goals from completed matches
      for (const match of completedMatches) {
        if (!match.result) continue
        
        for (const goal of match.result.goals) {
          const playerStat = playerGoals.get(goal.playerId)
          if (playerStat) {
            playerStat.goals++
          }
        }
      }

      // Sort players by goals (descending)
      const topScorers = Array.from(playerGoals.values())
        .filter(player => player.goals > 0)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10) // Top 10 scorers

      // Get category label
      const categoryLabel = league.category === 'CATEGORY_1_2' ? 'Categoría 1-2' :
                           league.category === 'CATEGORY_3_4' ? 'Categoría 3-4' :
                           'Categoría 5-6'

      standings.push({
        category: categoryLabel,
        standings: sortedStandings,
        topScorers: topScorers
      })
    }

    // Sort leagues by category
    standings.sort((a, b) => {
      const categoryOrder = { 'Categoría 1-2': 1, 'Categoría 3-4': 2, 'Categoría 5-6': 3 }
      return categoryOrder[a.category as keyof typeof categoryOrder] - 
             categoryOrder[b.category as keyof typeof categoryOrder]
    })

    return NextResponse.json(standings)
  } catch (error) {
    console.error("Error fetching standings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}