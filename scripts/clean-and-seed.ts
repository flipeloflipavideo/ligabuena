import { db } from '../src/lib/db'

async function main() {
  console.log('🧹 Cleaning database...')

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

  console.log('🌱 Seeding database with complete data...')

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

  console.log('✅ Created leagues')

  // Create teams for each football league
  for (const league of leagues.filter(l => l.sport === 'FOOTBALL')) {
    const teams = await Promise.all([
      db.team.create({
        data: {
          name: `Tigres ${league.name.split(' ')[1]}`,
          leagueId: league.id,
        },
      }),
      db.team.create({
        data: {
          name: `Águilas ${league.name.split(' ')[1]}`,
          leagueId: league.id,
        },
      }),
      db.team.create({
        data: {
          name: `Leones ${league.name.split(' ')[1]}`,
          leagueId: league.id,
        },
      }),
      db.team.create({
        data: {
          name: `Halcones ${league.name.split(' ')[1]}`,
          leagueId: league.id,
        },
      }),
    ])

    console.log(`✅ Created teams for ${league.name}`)

    // Create players for each team
    for (const team of teams) {
      await db.player.createMany({
        data: [
          { name: `Jugador 1 ${team.name}`, teamId: team.id },
          { name: `Jugador 2 ${team.name}`, teamId: team.id },
          { name: `Jugador 3 ${team.name}`, teamId: team.id },
          { name: `Jugador 4 ${team.name}`, teamId: team.id },
          { name: `Jugador 5 ${team.name}`, teamId: team.id },
        ],
      })
    }

    console.log(`✅ Created players for ${league.name}`)

    // Create some matches for the league
    const matches = []
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const match = await db.match.create({
          data: {
            leagueId: league.id,
            homeTeamId: teams[i].id,
            awayTeamId: teams[j].id,
            matchDate: new Date(`2024-10-${15 + i + j}T15:00:00`),
            venue: `Campo ${league.name}`,
            isCompleted: Math.random() > 0.3, // 70% completed
          },
        })
        matches.push(match)
      }
    }

    // Create results for completed matches
    for (const match of matches.filter(m => m.isCompleted)) {
      const homeScore = Math.floor(Math.random() * 5)
      const awayScore = Math.floor(Math.random() * 5)
      
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
      const allPlayers = [...homePlayers, ...awayPlayers]

      // Create random goals
      const totalGoals = homeScore + awayScore
      for (let i = 0; i < totalGoals; i++) {
        const randomPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)]
        const minute = Math.floor(Math.random() * 90) + 1
        
        await db.goal.create({
          data: {
            playerId: randomPlayer.id,
            matchResultId: result.id,
            minute,
          },
        })
      }
    }

    console.log(`✅ Created matches and results for ${league.name}`)
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

  console.log('✅ Created non-school days')
  console.log('🎉 Database seeded successfully with complete data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })