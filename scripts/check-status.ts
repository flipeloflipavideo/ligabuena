import { db } from '../src/lib/db'

async function main() {
  console.log('📊 Checking current database status...')
  
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
  
  // Show matches by league
  const leagues = await db.league.findMany({
    include: {
      matches: {
        include: {
          result: true
        }
      }
    }
  })
  
  console.log('\n📋 Matches by league:')
  for (const league of leagues) {
    const completed = league.matches.filter(m => m.isCompleted).length
    const total = league.matches.length
    console.log(`  ${league.name}: ${completed}/${total} matches completed`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error checking status:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })