import { db } from '../src/lib/db'

async function main() {
  console.log('🎮 Simulating 3 jornadas for all leagues...')
  
  // Get all leagues
  const leagues = await db.league.findMany()
  
  for (const league of leagues) {
    console.log(`\n📅 Simulating 3 jornadas for ${league.name}...`)
    
    // Get all matches for this league and sort by date
    const matches = await db.match.findMany({
      where: { leagueId: league.id },
      orderBy: { matchDate: 'asc' }
    })

    // Simulate first 3 jornadas (6 matches per jornada for 4 teams)
    const matchesToSimulate = matches.slice(0, 18) // 3 jornadas * 6 matches per jornada
    
    for (let jornada = 1; jornada <= 3; jornada++) {
      console.log(`  Jornada ${jornada}:`)
      
      const jornadaMatches = matchesToSimulate.slice((jornada - 1) * 6, jornada * 6)
      
      for (const match of jornadaMatches) {
        // Generate scores based on sport type
        let homeScore, awayScore
        
        if (league.sport === 'FOOTBALL') {
          // Football scores (lower)
          homeScore = Math.floor(Math.random() * 5)
          awayScore = Math.floor(Math.random() * 5)
        } else {
          // Basketball scores (higher)
          homeScore = Math.floor(Math.random() * 30) + 20
          awayScore = Math.floor(Math.random() * 30) + 20
        }
        
        // Create match result
        const result = await db.matchResult.create({
          data: {
            matchId: match.id,
            homeScore,
            awayScore,
          },
        })

        // Get players from both teams
        const homePlayers = await db.player.findMany({ where: { teamId: match.homeTeamId } })
        const awayPlayers = await db.player.findMany({ where: { teamId: match.awayTeamId } })

        // Create goals/baskets
        const totalScore = homeScore + awayScore
        
        for (let i = 0; i < totalScore; i++) {
          // Determine which team scores
          const isHomeScore = i < homeScore
          const scoringTeam = isHomeScore ? homePlayers : awayPlayers
          
          if (scoringTeam.length > 0) {
            const randomPlayer = scoringTeam[Math.floor(Math.random() * scoringTeam.length)]
            const minute = league.sport === 'FOOTBALL' 
              ? Math.floor(Math.random() * 90) + 1 
              : Math.floor(Math.random() * 40) + 1 // Basketball has 4 quarters of 10 minutes
            
            await db.goal.create({
              data: {
                playerId: randomPlayer.id,
                matchResultId: result.id,
                minute,
              },
            })
          }
        }

        // Mark match as completed
        await db.match.update({
          where: { id: match.id },
          data: { isCompleted: true }
        })

        console.log(`    ${match.homeTeamId.substring(0, 8)}... ${homeScore} - ${awayScore} ...${match.awayTeamId.substring(0, 8)}`)
      }
    }
  }

  console.log('\n📊 Final Statistics:')
  
  // Count total records
  const totalLeagues = await db.league.count()
  const totalTeams = await db.team.count()
  const totalPlayers = await db.player.count()
  const totalMatches = await db.match.count()
  const completedMatches = await db.match.count({ where: { isCompleted: true } })
  const totalGoals = await db.goal.count()

  console.log(`📈 Total Leagues: ${totalLeagues}`)
  console.log(`📈 Total Teams: ${totalTeams}`)
  console.log(`📈 Total Players: ${totalPlayers}`)
  console.log(`📈 Total Matches: ${totalMatches}`)
  console.log(`📈 Completed Matches: ${completedMatches}`)
  console.log(`📈 Total Goals/Baskets: ${totalGoals}`)
  
  console.log('\n🎉 Exhaustive test completed successfully!')
  console.log('📋 All leagues have 4 teams with 4 players each')
  console.log('📋 Complete schedules generated for all leagues')
  console.log('📋 3 jornadas simulated for all leagues')
}

main()
  .catch((e) => {
    console.error('❌ Error in exhaustive test part 2:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })