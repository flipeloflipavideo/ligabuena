import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

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

  // Create leagues
  const footballLeague1_2 = await db.league.create({
    data: {
      name: 'Fútbol 1-2',
      sport: 'FOOTBALL',
      category: 'CATEGORY_1_2',
      seasonId: season.id,
    },
  })

  const footballLeague3_4 = await db.league.create({
    data: {
      name: 'Fútbol 3-4',
      sport: 'FOOTBALL',
      category: 'CATEGORY_3_4',
      seasonId: season.id,
    },
  })

  const basketballLeague1_2 = await db.league.create({
    data: {
      name: 'Baloncesto 1-2',
      sport: 'BASKETBALL',
      category: 'CATEGORY_1_2',
      seasonId: season.id,
    },
  })

  console.log('✅ Created leagues')

  // Create teams for football 1-2
  const team1 = await db.team.create({
    data: {
      name: 'Tigres',
      leagueId: footballLeague1_2.id,
    },
  })

  const team2 = await db.team.create({
    data: {
      name: 'Águilas',
      leagueId: footballLeague1_2.id,
    },
  })

  // Create players for team1
  await db.player.createMany({
    data: [
      { name: 'Juan Pérez', teamId: team1.id },
      { name: 'Carlos López', teamId: team1.id },
      { name: 'Miguel Sánchez', teamId: team1.id },
    ],
  })

  // Create players for team2
  await db.player.createMany({
    data: [
      { name: 'Pedro García', teamId: team2.id },
      { name: 'Luis Martínez', teamId: team2.id },
      { name: 'Jorge Rodríguez', teamId: team2.id },
    ],
  })

  console.log('✅ Created teams and players')

  // Create a match
  const match = await db.match.create({
    data: {
      leagueId: footballLeague1_2.id,
      homeTeamId: team1.id,
      awayTeamId: team2.id,
      matchDate: new Date('2024-10-15T15:00:00'),
      venue: 'Campo Principal',
      isCompleted: true,
    },
  })

  // Create match result
  const result = await db.matchResult.create({
    data: {
      matchId: match.id,
      homeScore: 3,
      awayScore: 1,
    },
  })

  // Create goals
  await db.goal.createMany({
    data: [
      { playerId: (await db.player.findFirst({ where: { teamId: team1.id } }))!.id, matchResultId: result.id, minute: 15 },
      { playerId: (await db.player.findFirst({ where: { teamId: team1.id, name: 'Carlos López' } }))!.id, matchResultId: result.id, minute: 32 },
      { playerId: (await db.player.findFirst({ where: { teamId: team1.id, name: 'Miguel Sánchez' } }))!.id, matchResultId: result.id, minute: 67 },
      { playerId: (await db.player.findFirst({ where: { teamId: team2.id } }))!.id, matchResultId: result.id, minute: 45 },
    ],
  })

  console.log('✅ Created match and results')

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
        date: new Date('2025-04-14'),
        description: 'Semana Santa',
        seasonId: season.id,
      },
    ],
  })

  console.log('✅ Created non-school days')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })