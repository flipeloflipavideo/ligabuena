import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAvailableDates, isNonSchoolDay } from "@/lib/date-utils"

interface MatchPairing {
  homeTeamId: string
  awayTeamId: string
  round: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leagueId, startDate } = body

    if (!leagueId || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if league exists
    const league = await db.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: {
          orderBy: { name: 'asc' }
        },
        season: {
          include: {
            nonSchoolDays: true
          }
        }
      }
    })

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 })
    }

    // Check if we have enough teams (minimum 2)
    if (league.teams.length < 2) {
      return NextResponse.json({ 
        error: "Need at least 2 teams to generate matches" 
      }, { status: 400 })
    }

    // Check if matches already exist for this league
    const existingMatches = await db.match.findMany({
      where: { leagueId }
    })

    if (existingMatches.length > 0) {
      return NextResponse.json({ 
        error: "Matches already exist for this league. Delete existing matches first." 
      }, { status: 400 })
    }

    // Generate complete round-robin tournament with home and away matches
    const teams = league.teams
    const totalTeams = teams.length
    
    // Calculate how many complete cycles we can fit in the school year
    const seasonStart = new Date(league.season.startDate)
    const seasonEnd = new Date(league.season.endDate)
    const requestedStart = new Date(startDate)
    
    // Use the later of season start or requested start date
    const scheduleStart = requestedStart > seasonStart ? requestedStart : seasonStart
    
    // Get available dates for matches - ONLY FRIDAYS
    const availableDates = getAvailableDates(
      scheduleStart,
      seasonEnd,
      league.season.nonSchoolDays,
      [5], // ONLY FRIDAYS
      Math.ceil(teams.length / 2) // Max matches per day for this team count
    )
    
    if (availableDates.length === 0) {
      return NextResponse.json({ 
        error: "No available dates found for scheduling matches. Check non-school days and season dates." 
      }, { status: 400 })
    }
    
    // Calculate how many complete cycles we can fit in the school year
    const matchesPerTeamPerCycle = (totalTeams - 1) * 2 // Each team plays every other team twice
    const totalMatchesPerCycle = (totalTeams * matchesPerTeamPerCycle) / 2 // Divide by 2 to avoid double counting
    const maxMatchesPerDay = Math.ceil(teams.length / 2)
    const daysNeededPerCycle = Math.ceil(totalMatchesPerCycle / maxMatchesPerDay)
    const totalCycles = Math.floor(availableDates.length / daysNeededPerCycle)
    
    console.log(`Matches per cycle: ${totalMatchesPerCycle}`)
    console.log(`Days needed per cycle: ${daysNeededPerCycle}`)
    console.log(`Total cycles in school year: ${totalCycles}`)
    
    // Generate matches for each cycle
    const scheduledMatches = []
    let dateIndex = 0
    let totalMatchesScheduled = 0
    
    for (let cycle = 0; cycle < totalCycles && dateIndex < availableDates.length; cycle++) {
      console.log(`Scheduling cycle ${cycle + 1}`)
      
      // Generate all matchups for this cycle (double round-robin)
      const cycleMatches: MatchPairing[] = []
      let matchCounter = 1
      
      // Each team plays every other team twice: once at home, once away
      for (let i = 0; i < totalTeams; i++) {
        for (let j = 0; j < totalTeams; j++) {
          if (i !== j) { // Don't play against self
            cycleMatches.push({
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              round: matchCounter++
            })
          }
        }
      }
      
      // Schedule matches for this cycle
      let matchIndex = 0
      let cycleDateIndex = 0
      
      while (matchIndex < cycleMatches.length && cycleDateIndex < daysNeededPerCycle && dateIndex < availableDates.length) {
        const currentDate = availableDates[dateIndex]
        const matchesOnThisDate = []
        
        // Calculate how many matches we can schedule on this date
        const maxMatchesToday = Math.min(
          currentDate.availableSlots,
          cycleMatches.length - matchIndex,
          maxMatchesPerDay
        )
        
        // Schedule matches for this date
        for (let i = 0; i < maxMatchesToday; i++) {
          if (matchIndex < cycleMatches.length) {
            const match = cycleMatches[matchIndex]
            matchesOnThisDate.push({
              leagueId,
              homeTeamId: match.homeTeamId,
              awayTeamId: match.awayTeamId,
              matchDate: new Date(currentDate.date.getFullYear(), currentDate.date.getMonth(), currentDate.date.getDate(), 12, 0, 0), // Mediodía local para evitar problemas de zona horaria
              venue: `${league.name} - Cancha ${i + 1}`,
              // Add cycle and round information for organization
              round: match.round,
              cycle: cycle + 1
            })
            matchIndex++
            totalMatchesScheduled++
          }
        }
        
        scheduledMatches.push(...matchesOnThisDate)
        dateIndex++
        cycleDateIndex++
      }
    }
    
    if (totalMatchesScheduled === 0) {
      return NextResponse.json({ 
        error: `No matches were scheduled. Check available dates and match requirements.` 
      }, { status: 400 })
    }

    // Create all matches in database
    const createdMatches = await db.match.createMany({
      data: scheduledMatches.map(match => ({
        leagueId: match.leagueId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        matchDate: match.matchDate,
        venue: match.venue
      }))
    })

    // Return the created matches with full details
    const allMatchesWithDetails = await db.match.findMany({
      where: { leagueId },
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
      },
      orderBy: {
        matchDate: 'asc'
      }
    })

    // Generate summary statistics
    const summary = {
      totalMatches: allMatchesWithDetails.length,
      totalTeams: teams.length,
      seasonDates: {
        start: league.season.startDate,
        end: league.season.endDate
      },
      scheduledDates: {
        first: scheduledMatches[0]?.matchDate,
        last: scheduledMatches[scheduledMatches.length - 1]?.matchDate
      },
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        homeMatches: allMatchesWithDetails.filter(m => m.homeTeamId === team.id).length,
        awayMatches: allMatchesWithDetails.filter(m => m.awayTeamId === team.id).length
      }))
    }

    return NextResponse.json({
      matches: allMatchesWithDetails,
      summary
    })
    
  } catch (error) {
    console.error("Error generating matches:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}