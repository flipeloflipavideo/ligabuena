import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('📦 Exporting database data to SQL format...')
  
  // Get all data
  const seasons = await db.season.findMany()
  const leagues = await db.league.findMany()
  const teams = await db.team.findMany()
  const players = await db.player.findMany()
  const matches = await db.match.findMany()
  const matchResults = await db.matchResult.findMany()
  const goals = await db.goal.findMany()
  const nonSchoolDays = await db.nonSchoolDay.findMany()
  
  console.log(`📊 Found:
  - ${seasons.length} seasons
  - ${leagues.length} leagues
  - ${teams.length} teams
  - ${players.length} players
  - ${matches.length} matches
  - ${matchResults.length} match results
  - ${goals.length} goals
  - ${nonSchoolDays.length} non-school days`)
  
  // Generate SQL statements
  const sqlStatements = []
  
  sqlStatements.push('-- Database Export Script')
  sqlStatements.push('-- Generated on ' + new Date().toISOString())
  sqlStatements.push('--')
  sqlStatements.push('')
  
  // Insert statements for each table
  sqlStatements.push('-- Seasons')
  seasons.forEach(season => {
    sqlStatements.push(`INSERT INTO "Season" (id, name, "startDate", "endDate", "isActive", "createdAt", "updatedAt") VALUES ('${season.id}', '${season.name}', '${season.startDate.toISOString()}', '${season.endDate.toISOString()}', ${season.isActive}, '${season.createdAt.toISOString()}', '${season.updatedAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  sqlStatements.push('-- Leagues')
  leagues.forEach(league => {
    sqlStatements.push(`INSERT INTO "League" (id, name, sport, category, "seasonId", "createdAt", "updatedAt") VALUES ('${league.id}', '${league.name}', '${league.sport}', '${league.category}', '${league.seasonId}', '${league.createdAt.toISOString()}', '${league.updatedAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  sqlStatements.push('-- Teams')
  teams.forEach(team => {
    sqlStatements.push(`INSERT INTO "Team" (id, name, "leagueId", "createdAt", "updatedAt") VALUES ('${team.id}', '${team.name}', '${team.leagueId}', '${team.createdAt.toISOString()}', '${team.updatedAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  sqlStatements.push('-- Players')
  players.forEach(player => {
    sqlStatements.push(`INSERT INTO "Player" (id, name, "teamId", "createdAt", "updatedAt") VALUES ('${player.id}', '${player.name}', '${player.teamId}', '${player.createdAt.toISOString()}', '${player.updatedAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  sqlStatements.push('-- Matches')
  matches.forEach(match => {
    sqlStatements.push(`INSERT INTO "Match" (id, "leagueId", "homeTeamId", "awayTeamId", "matchDate", venue, "isCompleted", "createdAt", "updatedAt") VALUES ('${match.id}', '${match.leagueId}', '${match.homeTeamId}', '${match.awayTeamId}', '${match.matchDate.toISOString()}', '${match.venue || ''}', ${match.isCompleted}, '${match.createdAt.toISOString()}', '${match.updatedAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  sqlStatements.push('-- Match Results')
  matchResults.forEach(result => {
    sqlStatements.push(`INSERT INTO "MatchResult" (id, "matchId", "homeScore", "awayScore", "createdAt", "updatedAt") VALUES ('${result.id}', '${result.matchId}', ${result.homeScore}, ${result.awayScore}, '${result.createdAt.toISOString()}', '${result.updatedAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  sqlStatements.push('-- Goals')
  goals.forEach(goal => {
    sqlStatements.push(`INSERT INTO "Goal" (id, "playerId", "matchResultId", minute, "createdAt") VALUES ('${goal.id}', '${goal.playerId}', '${goal.matchResultId}', ${goal.minute || 'NULL'}, '${goal.createdAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  sqlStatements.push('-- Non-School Days')
  nonSchoolDays.forEach(day => {
    sqlStatements.push(`INSERT INTO "NonSchoolDay" (id, date, description, "seasonId", "createdAt") VALUES ('${day.id}', '${day.date.toISOString()}', '${day.description}', '${day.seasonId}', '${day.createdAt.toISOString()}');`)
  })
  sqlStatements.push('')
  
  // Save to file
  const backupDir = path.join(__dirname, '..', 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir)
  }
  
  const filename = `database-export-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`
  const filepath = path.join(backupDir, filename)
  
  fs.writeFileSync(filepath, sqlStatements.join('\n'))
  
  console.log(`✅ Data exported successfully to: ${filepath}`)
  console.log(`📁 File size: ${Math.round(fs.statSync(filepath).size / 1024)} KB`)
}

main()
  .catch((e) => {
    console.error('❌ Error exporting data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })