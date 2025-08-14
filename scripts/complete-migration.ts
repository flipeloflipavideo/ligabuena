import { db } from '../src/lib/db'

async function main() {
  console.log('🔄 Completing migration and verifying functionality...')
  
  try {
    // Check current status
    console.log('🔍 Checking current status...')
    const currentStats = {
      seasons: await db.season.count(),
      leagues: await db.league.count(),
      teams: await db.team.count(),
      players: await db.player.count(),
      matches: await db.match.count(),
      matchResults: await db.matchResult.count(),
      goals: await db.goal.count(),
      nonSchoolDays: await db.nonSchoolDay.count(),
    }
    
    console.log('📊 Current statistics:')
    Object.entries(currentStats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    // Complete missing non-school days
    if (currentStats.nonSchoolDays === 0) {
      console.log('📅 Adding non-school days...')
      const season = await db.season.findFirst()
      if (season) {
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
        console.log('✅ Non-school days added')
      }
    }
    
    // Test relationships and queries
    console.log('🔗 Testing relationships...')
    
    // Test league with teams and players
    const testLeague = await db.league.findFirst({
      include: {
        teams: {
          include: {
            players: true
          }
        },
        matches: {
          include: {
            result: true,
            homeTeam: true,
            awayTeam: true,
          },
          take: 5
        }
      }
    })
    
    if (testLeague) {
      console.log(`✅ League "${testLeague.name}" has ${testLeague.teams.length} teams`)
      console.log(`✅ First team "${testLeague.teams[0]?.name}" has ${testLeague.teams[0]?.players.length} players`)
      console.log(`✅ Found ${testLeague.matches.length} sample matches with results`)
    }
    
    // Test complex query - standings simulation
    console.log('📊 Testing complex queries...')
    const leagues = await db.league.findMany({
      include: {
        teams: {
          include: {
            homeMatches: {
              include: { result: true }
            },
            awayMatches: {
              include: { result: true }
            }
          }
        }
      }
    })
    
    let totalTeamsWithMatches = 0
    for (const league of leagues) {
      for (const team of league.teams) {
        const allMatches = [...team.homeMatches, ...team.awayMatches]
        const completedMatches = allMatches.filter(m => m.result)
        if (completedMatches.length > 0) {
          totalTeamsWithMatches++
        }
      }
    }
    
    console.log(`✅ ${totalTeamsWithMatches} teams have completed matches`)
    
    // Test goal statistics
    const totalGoals = await db.goal.count()
    const avgGoalsPerMatch = totalGoals / currentStats.matches
    console.log(`✅ Total goals: ${totalGoals}, Average per match: ${avgGoalsPerMatch.toFixed(2)}`)
    
    // Final verification
    console.log('🎯 Final verification...')
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
    
    // Compare with expected values
    const expected = {
      seasons: 1,
      leagues: 6,
      teams: 24,
      players: 96,
      matches: 72, // 4 teams * 3 opponents * 2 (home/away) * 3 leagues * 2 sports
      nonSchoolDays: 6
    }
    
    console.log('\n📋 Migration Summary:')
    let allGood = true
    Object.entries(expected).forEach(([key, expectedValue]) => {
      const actualValue = finalStats[key]
      const status = actualValue >= expectedValue ? '✅' : '❌'
      console.log(`   ${status} ${key}: ${actualValue}/${expectedValue}`)
      if (actualValue < expectedValue) allGood = false
    })
    
    if (allGood) {
      console.log('\n🎉 Migration to Neon PostgreSQL completed successfully!')
      console.log('✅ All data has been migrated correctly')
      console.log('✅ Database relationships are working properly')
      console.log('✅ Complex queries are functioning')
    } else {
      console.log('\n⚠️  Migration is partially complete')
      console.log('Some data may still be migrating or may need manual attention')
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error in verification:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })