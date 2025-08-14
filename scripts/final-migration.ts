import { db } from '../src/lib/db'

async function main() {
  console.log('🚀 Final migration to Neon PostgreSQL...')
  
  try {
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
    console.log('✅ Season created')
    
    // Create leagues
    console.log('🏆 Creating leagues...')
    const leagues = await Promise.all([
      db.league.create({ data: { name: 'Fútbol 1-2', sport: 'FOOTBALL', category: 'CATEGORY_1_2', seasonId: season.id } }),
      db.league.create({ data: { name: 'Fútbol 3-4', sport: 'FOOTBALL', category: 'CATEGORY_3_4', seasonId: season.id } }),
      db.league.create({ data: { name: 'Fútbol 5-6', sport: 'FOOTBALL', category: 'CATEGORY_5_6', seasonId: season.id } }),
      db.league.create({ data: { name: 'Baloncesto 1-2', sport: 'BASKETBALL', category: 'CATEGORY_1_2', seasonId: season.id } }),
      db.league.create({ data: { name: 'Baloncesto 3-4', sport: 'BASKETBALL', category: 'CATEGORY_3_4', seasonId: season.id } }),
      db.league.create({ data: { name: 'Baloncesto 5-6', sport: 'BASKETBALL', category: 'CATEGORY_5_6', seasonId: season.id } }),
    ])
    console.log('✅ Created 6 leagues')
    
    // Team and player names
    const teamNames = {
      'CATEGORY_1_2': ['Tigres', 'Águilas', 'Leones', 'Halcones'],
      'CATEGORY_3_4': ['Panteras', 'Cobras', 'Águilas Reales', 'Lobos'],
      'CATEGORY_5_6': ['Dragones', 'Fénix', 'Centinelas', 'Guerreros']
    }
    
    const playerNames = {
      'CATEGORY_1_2': ['Carlos', 'Mateo', 'Sofía', 'Isabella'],
      'CATEGORY_3_4': ['Alejandro', 'Valentina', 'Sebastián', 'Camila'],
      'CATEGORY_5_6': ['Diego', 'Mariana', 'Lucas', 'Valeria']
    }
    
    // Create teams and players
    console.log('👥 Creating teams and players...')
    for (const league of leagues) {
      const category = league.category
      const teams = []
      
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
    }
    
    // Create sample matches for each league
    console.log('⚽ Creating matches...')
    for (const league of leagues) {
      const teams = await db.team.findMany({ where: { leagueId: league.id } })
      
      // Create 6 matches per league (simplified version)
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 4; j++) {
          const match = await db.match.create({
            data: {
              leagueId: league.id,
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              matchDate: new Date(`2024-10-${15 + i + j}T15:00:00`),
              venue: `Campo ${league.name}`,
              isCompleted: true,
            },
          })
          
          // Create result
          const homeScore = Math.floor(Math.random() * 5)
          const awayScore = Math.floor(Math.random() * 5)
          
          console.log(`   Creating match result: ${homeScore} - ${awayScore}`)
          
          const result = await db.matchResult.create({
            data: {
              matchId: match.id,
              homeScore,
              awayScore,
            },
          })
          
          // Create some goals
          const totalGoals = homeScore + awayScore
          const players = await db.player.findMany({
            where: { teamId: { in: [teams[i].id, teams[j].id] } }
          })
          
          console.log(`   Creating ${totalGoals} goals...`)
          for (let k = 0; k < totalGoals; k++) {
            const randomPlayer = players[Math.floor(Math.random() * players.length)]
            await db.goal.create({
              data: {
                playerId: randomPlayer.id,
                matchResultId: result.id,
                minute: Math.floor(Math.random() * 90) + 1,
              },
            })
          }
        }
      }
      console.log(`✅ Created 6 matches for ${league.name}`)
    }
    
    // Create non-school days
    console.log('📅 Creating non-school days...')
    await db.nonSchoolDay.createMany({
      data: [
        { date: new Date('2024-12-20'), description: 'Vacaciones de Navidad', seasonId: season.id },
        { date: new Date('2024-12-21'), description: 'Vacaciones de Navidad', seasonId: season.id },
        { date: new Date('2024-12-22'), description: 'Vacaciones de Navidad', seasonId: season.id },
      ],
    })
    console.log('✅ Created non-school days')
    
    // Final verification
    console.log('🔍 Final verification...')
    const stats = {
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
    Object.entries(stats).forEach(([key, value]) => {
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