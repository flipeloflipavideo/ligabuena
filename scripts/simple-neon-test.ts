import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔌 Simple Neon PostgreSQL test...')
  
  try {
    // Test connection
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Connection successful!')
    
    // Create a simple test record
    const season = await prisma.season.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isActive: true,
      },
    })
    
    console.log('✅ Season created:', season.id)
    
    // Create a league
    const league = await prisma.league.create({
      data: {
        name: 'Fútbol Test',
        sport: 'FOOTBALL',
        category: 'CATEGORY_1_2',
        seasonId: season.id,
      },
    })
    
    console.log('✅ League created:', league.id)
    
    // Create a team
    const team = await prisma.team.create({
      data: {
        name: 'Test Team',
        leagueId: league.id,
      },
    })
    
    console.log('✅ Team created:', team.id)
    
    // Create a player
    const player = await prisma.player.create({
      data: {
        name: 'Test Player',
        teamId: team.id,
      },
    })
    
    console.log('✅ Player created:', player.id)
    
    // Verify counts
    const counts = {
      seasons: await prisma.season.count(),
      leagues: await prisma.league.count(),
      teams: await prisma.team.count(),
      players: await prisma.player.count(),
    }
    
    console.log('📊 Current counts:', counts)
    
    console.log('🎉 Simple test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in simple test:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error in simple test:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })