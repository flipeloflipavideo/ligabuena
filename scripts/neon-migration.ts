import { db } from '../src/lib/db'

async function main() {
  console.log('🔄 Starting migration to Neon PostgreSQL...')
  
  try {
    // Clear existing data first
    console.log('🧹 Clearing existing data...')
    await db.goal.deleteMany()
    await db.matchResult.deleteMany()
    await db.match.deleteMany()
    await db.player.deleteMany()
    await db.team.deleteMany()
    await db.league.deleteMany()
    await db.nonSchoolDay.deleteMany()
    await db.season.deleteMany()
    console.log('✅ Data cleared')
    
    // Create season
    console.log('📅 Creating season...')
    const season = await db.season.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isActive: true,
      },
    })
    console.log('✅ Season created:', season.id)
    
    // Create leagues
    console.log('🏆 Creating leagues...')
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
    console.log('✅ Created', leagues.length, 'leagues')
    
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
    
    // Create teams and players
    console.log('👥 Creating teams and players...')
    const allTeams = []
    
    for (const league of leagues) {
      const category = league.category
      
      for (let i = 0; i < 4; i++) {
        const team = await db.team.create({
          data: {
            name: `${teamNames[category][i]} ${league.name.split(' ')[1]}`,
            leagueId: league.id,
          },
        })
        allTeams.push(team)
        
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
    }
    
    console.log(`✅ Created ${allTeams.length} teams and ${allTeams.length * 4} players`)
    
    // Create matches for each league
    console.log('⚽ Creating matches...')
    let totalMatches = 0
    let totalGoals = 0
    
    for (const league of leagues) {
      const teams = allTeams.filter(team => team.leagueId === league.id)
      
      // Create round-robin matches (each team plays every other team twice)
      for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length; j++) {
          if (i !== j) {
            const matchDate = new Date(2024, 9, 15 + totalMatches, 15, 0, 0) // Month is 0-indexed
            
            const match = await db.match.create({
              data: {
                leagueId: league.id,
                homeTeamId: teams[i].id,
                awayTeamId: teams[j].id,
                matchDate,
                venue: `Campo ${league.name}`,
                isCompleted: true,
              },
            })
            
            // Create match result
            let homeScore, awayScore
            if (league.sport === 'FOOTBALL') {
              homeScore = Math.floor(Math.random() * 5)
              awayScore = Math.floor(Math.random() * 5)
            } else {
              homeScore = Math.floor(Math.random() * 30) + 20
              awayScore = Math.floor(Math.random() * 30) + 20
            }
            
            const result = await db.matchResult.create({
              data: {
                matchId: match.id,
                homeScore,
                awayScore,
              },
            })
            
            // Create goals/baskets
            const totalScore = homeScore + awayScore
            const players = await db.player.findMany({
              where: { teamId: { in: [teams[i].id, teams[j].id] } }
            })
            
            for (let k = 0; k < totalScore; k++) {
              const randomPlayer = players[Math.floor(Math.random() * players.length)]
              const minute = league.sport === 'FOOTBALL' 
                ? Math.floor(Math.random() * 90) + 1 
                : Math.floor(Math.random() * 40) + 1
              
              await db.goal.create({
                data: {
                  playerId: randomPlayer.id,
                  matchResultId: result.id,
                  minute,
                },
              })
              totalGoals++
            }
            
            totalMatches++
          }
        }
      }
    }
    
    console.log(`✅ Created ${totalMatches} matches with ${totalGoals} goals`)
    
    // Create non-school days
    console.log('📅 Creating non-school days...')
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
    console.log('✅ Created non-school days')
    
    // Final verification
    console.log('🔍 Final verification...')
    const finalStats = {
      seasons: await db.season.count(),
      leagues: await db.league.count(),
      teams: await db.team.count(),
      players: await db.player.count(),
      matches: await db.match.count(),
      matchResults: await db.matchResult.count(),
      goals: await db.goal.count(),
      nonSchoolDays: await db.nonSchoolDay.count(),
    }
    
    console.log('📊 Final statistics:')
    Object.entries(finalStats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    console.log('🎉 Migration to Neon PostgreSQL completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error in migration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })