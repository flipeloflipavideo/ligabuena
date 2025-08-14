import { db } from '../src/lib/db'

async function main() {
  console.log('🧹 Cleaning database for complete schedule test...')

  // Delete all data in correct order
  await db.goal.deleteMany()
  await db.matchResult.deleteMany()
  await db.match.deleteMany()
  await db.player.deleteMany()
  await db.team.deleteMany()
  await db.league.deleteMany()
  await db.nonSchoolDay.deleteMany()
  await db.season.deleteMany()

  console.log('✅ Database cleaned')

  console.log('🌱 Creating test data for complete schedule...')

  // Create a complete school year season
  const season = await db.season.create({
    data: {
      name: '2024-2025',
      startDate: new Date('2024-08-19'), // Start of school year in Mexico
      endDate: new Date('2025-07-15'),   // End of school year in Mexico
      isActive: true,
    },
  })
  console.log('✅ Created season:', season.name)

  // Create comprehensive non-school days for Mexican school calendar
  await db.nonSchoolDay.createMany({
    data: [
      // September 2024
      { date: new Date('2024-09-16'), description: 'Día de la Independencia', seasonId: season.id },
      
      // October 2024
      { date: new Date('2024-10-14'), description: 'Consejo Técnico Escolar', seasonId: season.id },
      
      // November 2024
      { date: new Date('2024-11-18'), description: 'Consejo Técnico Escolar', seasonId: season.id },
      { date: new Date('2024-11-20'), description: 'Día de la Revolución', seasonId: season.id },
      
      // December 2024 - January 2025 (Christmas Vacation)
      { date: new Date('2024-12-20'), description: 'Inicio de Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-21'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-22'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-23'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-24'), description: 'Nochebuena', seasonId: season.id },
      { date: new Date('2024-12-25'), description: 'Navidad', seasonId: season.id },
      { date: new Date('2024-12-26'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-27'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-28'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-29'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-30'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2024-12-31'), description: 'Fin de Año', seasonId: season.id },
      { date: new Date('2025-01-01'), description: 'Año Nuevo', seasonId: season.id },
      { date: new Date('2025-01-02'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2025-01-03'), description: 'Vacaciones de Navidad', seasonId: season.id },
      { date: new Date('2025-01-06'), description: 'Día de Reyes', seasonId: season.id },
      { date: new Date('2025-01-07'), description: 'Consejo Técnico Escolar', seasonId: season.id },
      
      // February 2025
      { date: new Date('2025-02-03'), description: 'Día de la Constitución', seasonId: season.id },
      { date: new Date('2025-02-04'), description: 'Día de la Constitución', seasonId: season.id },
      { date: new Date('2025-02-17'), description: 'Consejo Técnico Escolar', seasonId: season.id },
      
      // March 2025
      { date: new Date('2025-03-17'), description: 'Natalicio de Benito Juárez', seasonId: season.id },
      { date: new Date('2025-03-18'), description: 'Natalicio de Benito Juárez', seasonId: season.id },
      { date: new Date('2025-03-31'), description: 'Consejo Técnico Escolar', seasonId: season.id },
      
      // April 2025 (Easter Week)
      { date: new Date('2025-04-14'), description: 'Semana Santa', seasonId: season.id },
      { date: new Date('2025-04-15'), description: 'Semana Santa', seasonId: season.id },
      { date: new Date('2025-04-16'), description: 'Semana Santa', seasonId: season.id },
      { date: new Date('2025-04-17'), description: 'Semana Santa', seasonId: season.id },
      { date: new Date('2025-04-18'), description: 'Viernes Santo', seasonId: season.id },
      
      // May 2025
      { date: new Date('2025-05-01'), description: 'Día del Trabajo', seasonId: season.id },
      { date: new Date('2025-05-05'), description: 'Consejo Técnico Escolar', seasonId: season.id },
      { date: new Date('2025-05-15'), description: 'Día del Maestro', seasonId: season.id },
      
      // June 2025
      { date: new Date('2025-06-02'), description: 'Consejo Técnico Escolar', seasonId: season.id },
    ],
  })

  console.log('✅ Created comprehensive non-school days')

  // Create a football league with 6 teams for better testing
  const footballLeague = await db.league.create({
    data: {
      name: 'Fútbol Infantil',
      sport: 'FOOTBALL',
      category: 'CATEGORY_3_4',
      seasonId: season.id,
    },
  })

  console.log('✅ Created football league')

  // Create 6 teams for more interesting schedule
  const teams = await Promise.all([
    db.team.create({ data: { name: 'Tigres', leagueId: footballLeague.id } }),
    db.team.create({ data: { name: 'Águilas', leagueId: footballLeague.id } }),
    db.team.create({ data: { name: 'Leones', leagueId: footballLeague.id } }),
    db.team.create({ data: { name: 'Halcones', leagueId: footballLeague.id } }),
    db.team.create({ data: { name: 'Panteras', leagueId: footballLeague.id } }),
    db.team.create({ data: { name: 'Lobos', leagueId: footballLeague.id } }),
  ])

  console.log('✅ Created 6 teams')

  // Create players for each team
  for (const team of teams) {
    await db.player.createMany({
      data: [
        { name: `Capitán ${team.name}`, teamId: team.id },
        { name: `Jugador 2 ${team.name}`, teamId: team.id },
        { name: `Jugador 3 ${team.name}`, teamId: team.id },
        { name: `Jugador 4 ${team.name}`, teamId: team.id },
        { name: `Jugador 5 ${team.name}`, teamId: team.id },
        { name: `Jugador 6 ${team.name}`, teamId: team.id },
        { name: `Jugador 7 ${team.name}`, teamId: team.id },
      ],
    })
  }

  console.log('✅ Created players for all teams')
  console.log('🎉 Test data created successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`- Season: ${season.name} (${season.startDate.toLocaleDateString()} - ${season.endDate.toLocaleDateString()})`)
  console.log(`- League: ${footballLeague.name} (${footballLeague.sport})`)
  console.log(`- Teams: ${teams.length}`)
  console.log(`- Non-school days: 35+ days including holidays and vacations`)
  console.log('')
  console.log('🚀 Ready to test complete schedule generation!')
  console.log('Use the league ID to test the new match generation API:')
  console.log(`League ID: ${footballLeague.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Error creating test data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })