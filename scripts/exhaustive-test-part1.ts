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
  console.log('🎉 Part 1 completed - All teams, players and schedules created!')
}

main()
  .catch((e) => {
    console.error('❌ Error in exhaustive test part 1:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })