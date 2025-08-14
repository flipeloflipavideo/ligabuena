import { db } from '../src/lib/db'

async function main() {
  console.log('🔌 Testing Neon PostgreSQL connection...')
  
  try {
    // Test basic connection
    await db.$executeRaw`SELECT 1`
    console.log('✅ Connection successful!')
    
    // Check if tables exist
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `
    
    console.log('📋 Tables in database:', tables)
    
    // Test creating a simple record
    const testSeason = await db.season.create({
      data: {
        name: 'Test Season',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
      },
    })
    
    console.log('✅ Test record created:', testSeason.id)
    
    // Clean up test record
    await db.season.delete({
      where: { id: testSeason.id }
    })
    
    console.log('✅ Test record deleted')
    console.log('🎉 Neon PostgreSQL connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error in connection test:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })