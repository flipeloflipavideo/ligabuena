import { db } from '../src/lib/db'

async function main() {
  console.log('🔍 Checking Neon PostgreSQL status...')
  
  try {
    const seasonCount = await db.season.count()
    const leagueCount = await db.league.count()
    const teamCount = await db.team.count()
    const playerCount = await db.player.count()
    const matchCount = await db.match.count()
    const matchResultCount = await db.matchResult.count()
    const goalCount = await db.goal.count()
    const nonSchoolDayCount = await db.nonSchoolDay.count()
    
    console.log('📊 Current data in Neon PostgreSQL:')
    console.log(`   Seasons: ${seasonCount}`)
    console.log(`   Leagues: ${leagueCount}`)
    console.log(`   Teams: ${teamCount}`)
    console.log(`   Players: ${playerCount}`)
    console.log(`   Matches: ${matchCount}`)
    console.log(`   Match Results: ${matchResultCount}`)
    console.log(`   Goals: ${goalCount}`)
    console.log(`   Non-School Days: ${nonSchoolDayCount}`)
    
    if (seasonCount === 0) {
      console.log('📥 Database is empty, ready for import')
    } else {
      console.log('📋 Database already has data')
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error in status check:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })