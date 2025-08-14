import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migrating data to Neon PostgreSQL...')
  
  try {
    // First, let's create the basic structure
    console.log('📅 Creating season...')
    const season = await prisma.season.create({
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
      prisma.league.create({
        data: {
          name: 'Fútbol 1-2',
          sport: 'FOOTBALL',
          category: 'CATEGORY_1_2',
          seasonId: season.id,
        },
      }),
      prisma.league.create({
        data: {
          name: 'Fútbol 3-4',
          sport: 'FOOTBALL',
          category: 'CATEGORY_3_4',
          seasonId: season.id,
        },
      }),
      prisma.league.create({
        data: {
          name: 'Fútbol 5-6',
          sport: 'FOOTBALL',
          category: 'CATEGORY_5_6',
          seasonId: season.id,
        },
      }),
      prisma.league.create({
        data: {
          name: 'Baloncesto 1-2',
          sport: 'BASKETBALL',
          category: 'CATEGORY_1_2',
          seasonId: season.id,
        },
      }),
      prisma.league.create({
        data: {
          name: 'Baloncesto 3-4',
          sport: 'BASKETBALL',
          category: 'CATEGORY_3_4',
          seasonId: season.id,
        },
      }),
      prisma.league.create({
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
    let totalTeams = 0
    let totalPlayers = 0
    
    for (const league of leagues) {
      const category = league.category
      
      for (let i = 0; i < 4; i++) {
        const team = await prisma.team.create({
          data: {
            name: `${teamNames[category][i]} ${league.name.split(' ')[1]}`,
            leagueId: league.id,
          },
        })
        totalTeams++
        
        // Create 4 players for each team
        for (let j = 0; j < 4; j++) {
          await prisma.player.create({
            data: {
              name: `${playerNames[category][j]} ${team.name}`,
              teamId: team.id,
            },
          })
          totalPlayers++
        }
      }
    }
    
    console.log(`✅ Created ${totalTeams} teams and ${totalPlayers} players`)
    
    // Create some sample matches
    console.log('⚽ Creating sample matches...')
    let totalMatches = 0
    
    for (const league of leagues) {
      const teams = await prisma.team.findMany({
        where: { leagueId: league.id }
      })
      
      // Create a few matches for each league
      for (let i = 0; i < teams.length - 1; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const match = await prisma.match.create({
            data: {
              leagueId: league.id,
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              matchDate: new Date(`2024-10-${15 + totalMatches}T15:00:00`),
              venue: `Campo ${league.name}`,
              isCompleted: true,
            },
          })
          
          // Create match result
          const homeScore = Math.floor(Math.random() * 5)
          const awayScore = Math.floor(Math.random() * 5)
          
          const result = await prisma.matchResult.create({
            data: {
              matchId: match.id,
              homeScore,
              awayScore,
            },
          })
          
          // Create some goals
          const totalGoals = homeScore + awayScore
          const players = await prisma.player.findMany({
            where: { teamId: { in: [teams[i].id, teams[j].id] } }
          })
          
          for (let k = 0; k < totalGoals; k++) {
            const randomPlayer = players[Math.floor(Math.random() * players.length)]
            await prisma.goal.create({
              data: {
                playerId: randomPlayer.id,
                matchResultId: result.id,
                minute: Math.floor(Math.random() * 90) + 1,
              },
            })
          }
          
          totalMatches++
        }
      }
    }
    
    console.log(`✅ Created ${totalMatches} matches with results`)
    
    // Create non-school days
    console.log('📅 Creating non-school days...')
    await prisma.nonSchoolDay.createMany({
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
      ],
    })
    
    console.log('✅ Created non-school days')
    
    // Final verification
    console.log('🔍 Final verification...')
    const finalStats = {
      seasons: await prisma.season.count(),
      leagues: await prisma.league.count(),
      teams: await prisma.team.count(),
      players: await prisma.player.count(),
      matches: await prisma.match.count(),
      matchResults: await prisma.matchResult.count(),
      goals: await prisma.goal.count(),
      nonSchoolDays: await prisma.nonSchoolDay.count(),
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
    await prisma.$disconnect()
  })