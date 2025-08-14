import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('📥 Importing data to Neon PostgreSQL...')
  
  // Read the SQL export file
  const backupDir = path.join(__dirname, '..', 'backups')
  const files = fs.readdirSync(backupDir)
  const sqlFile = files.find(f => f.startsWith('database-export-') && f.endsWith('.sql'))
  
  if (!sqlFile) {
    console.error('❌ No SQL export file found')
    process.exit(1)
  }
  
  const sqlContent = fs.readFileSync(path.join(backupDir, sqlFile), 'utf8')
  
  console.log(`📄 Reading from: ${sqlFile}`)
  console.log(`📊 File size: ${Math.round(sqlContent.length / 1024)} KB`)
  
  // Clear existing data
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
  
  // Parse and execute SQL statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.startsWith('INSERT INTO') && !s.startsWith('--'))
  
  console.log(`📋 Found ${statements.length} INSERT statements`)
  
  // Execute statements in batches
  const batchSize = 50
  for (let i = 0; i < statements.length; i += batchSize) {
    const batch = statements.slice(i, i + batchSize)
    console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(statements.length / batchSize)}`)
    
    for (const statement of batch) {
      try {
        await db.$executeRawUnsafe(statement + ';')
      } catch (error) {
        console.error('❌ Error executing statement:', statement.substring(0, 100) + '...')
        console.error('Error:', error.message)
      }
    }
  }
  
  console.log('✅ All statements executed')
  
  // Verify data import
  console.log('🔍 Verifying imported data...')
  
  const seasonCount = await db.season.count()
  const leagueCount = await db.league.count()
  const teamCount = await db.team.count()
  const playerCount = await db.player.count()
  const matchCount = await db.match.count()
  const matchResultCount = await db.matchResult.count()
  const goalCount = await db.goal.count()
  const nonSchoolDayCount = await db.nonSchoolDay.count()
  
  console.log('📊 Imported data summary:')
  console.log(`   Seasons: ${seasonCount}`)
  console.log(`   Leagues: ${leagueCount}`)
  console.log(`   Teams: ${teamCount}`)
  console.log(`   Players: ${playerCount}`)
  console.log(`   Matches: ${matchCount}`)
  console.log(`   Match Results: ${matchResultCount}`)
  console.log(`   Goals: ${goalCount}`)
  console.log(`   Non-School Days: ${nonSchoolDayCount}`)
  
  // Test a query to make sure relationships work
  console.log('🔗 Testing relationships...')
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
          awayTeam: true
        },
        take: 3
      }
    }
  })
  
  if (testLeague) {
    console.log(`✅ League "${testLeague.name}" has ${testLeague.teams.length} teams`)
    console.log(`✅ First team "${testLeague.teams[0]?.name}" has ${testLeague.teams[0]?.players.length} players`)
    console.log(`✅ Found ${testLeague.matches.length} matches with results`)
  }
  
  console.log('🎉 Data import completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error importing data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })