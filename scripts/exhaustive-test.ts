import { db } from '../src/lib/db'

async function main() {
  console.log('🧹 Cleaning database for exhaustive test...')

  // Delete all data in correct order (respecting foreign keys)
  await db.goal.deleteMany()
  await db.matchResult.deleteMany()
  await db.match.deleteMany()
  await db.player.deleteMany()
  await db.team.deleteMany()
  await db.league.deleteMany()
  await db.nonSchoolDay.deleteMany()
  await db.season.deleteMany()

  console.log('✅ Database cleaned')

  console.log('🌱 Starting exhaustive test with complete data...')

  // Create a sample season
  const season = await db.season.create({
    data: {
      name: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
    },
  })
  console.log('✅ Created season:', season.name)

  // Create leagues for all categories and sports
  const leagues = await Promise.all([
    db.league.create({
      data: {
        name: 'Fútbol 1-2',
        sport: 'FOOTBALL',
        category: 'CATEGORY_1_2',
        seasonId: season.id,
      },
    }),
    db.league.create({
      data: {
        name: 'Fútbol 3-4',
        sport: 'FOOTBALL',
        category: 'CATEGORY_3_4',
        seasonId: season.id,
      },
    }),
    db.league.create({
      data: {
        name: 'Fútbol 5-6',
        sport: 'FOOTBALL',
        category: 'CATEGORY_5_6',
        seasonId: season.id,
      },
    }),
    db.league.create({
      data: {
        name: 'Baloncesto 1-2',
        sport: 'BASKETBALL',
        category: 'CATEGORY_1_2',
        seasonId: season.id,
      },
    }),
    db.league.create({
      data: {
        name: 'Baloncesto 3-4',
        sport: 'BASKETBALL',
        category: 'CATEGORY_3_4',
        seasonId: season.id,
      },
    }),
    db.league.create({
      data: {
        name: 'Baloncesto 5-6',
        sport: 'BASKETBALL',
        category: 'CATEGORY_5_6',
        seasonId: season.id,
      },
    }),
  ])

  console.log('✅ Created 6 leagues')

  // Team names for each category
  const teamNames = {
    'CATEGORY_1_2': ['Tigres', 'Águilas', 'Leones', 'Halcones'],
    'CATEGORY_3_4': ['Panteras', 'Cobras', 'Águilas Reales', 'Lobos'],
    'CATEGORY_5_6': ['Dragones', 'Fénix', 'Centinelas', 'Guerreros']
  }

  // Player names for each category
  const playerNames = {
    'CATEGORY_1_2': ['Carlos', 'Mateo', 'Sofía', 'Isabella'],
    'CATEGORY_3_4': ['Alejandro', 'Valentina', 'Sebastián', 'Camila'],
    'CATEGORY_5_6': ['Diego', 'Mariana', 'Lucas', 'Valeria']
  }

  // Create teams and players for all leagues
  for (const league of leagues) {
    const category = league.category
    const teams = []
    
    // Create 4 teams for each league
    for (let i = 0; i < 4; i++) {
      const team = await db.team.create({
        data: {
          name: `${teamNames[category][i]} ${league.name.split(' ')[1]}`,
          leagueId: league.id,
        },
      })
      teams.push(team)

      // Create 4 players for each team
      for (let j = 0; j < 4; j++) {
        await db.player.create({
          data: {
            name: `${playerNames[category][j]} ${team.name}`,
            teamId: team.id,
          },
        })
      }
    }

    console.log(`✅ Created 4 teams with 4 players each for ${league.name}`)

    // Generate complete schedule (round-robin tournament)
    const matches = []
    
    // Each team plays against every other team twice (home and away)
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i !== j) {
          const matchDate = new Date(`2024-10-${15 + i * teams.length + j}T15:00:00`)
          const match = await db.match.create({
            data: {
              leagueId: league.id,
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              matchDate,
              venue: `Campo ${league.name}`,
              isCompleted: false, // All matches start as not completed
            },
          })
          matches.push(match)
        }
      }
    }

    console.log(`✅ Created ${matches.length} matches for ${league.name}`)

    // Store matches for simulation
    league.matches = matches
    league.teams = teams
  }

  console.log('✅ Created all teams, players and schedules')

  // Simulate 3 jornadas for all leagues
  console.log('🎮 Simulating 3 jornadas for all leagues...')
  
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

  // Create some non-school days
  await db.nonSchoolDay.createMany({
    data: [
      {
        date: new Date('2024-12-20'),
        description: 'Vacaciones de Navidad',
        seasonId: season.id,
      },
      {
        date: new Date('2024-12-21'),
        description: 'Vacaciones de Navidad',
        seasonId: season.id,
      },
      {
        date: new Date('2024-12-22'),
        description: 'Vacaciones de Navidad',
        seasonId: season.id,
      },
      {
        date: new Date('2025-04-14'),
        description: 'Semana Santa',
        seasonId: season.id,
      },
      {
        date: new Date('2025-04-15'),
        description: 'Semana Santa',
        seasonId: season.id,
      },
      {
        date: new Date('2025-04-16'),
        description: 'Semana Santa',
        seasonId: season.id,
      },
    ],
  })

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
    console.error('❌ Error in exhaustive test:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })