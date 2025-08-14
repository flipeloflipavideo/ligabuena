import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function DELETE() {
  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      error: "This endpoint is only available in development mode" 
    }, { status: 403 })
  }

  try {
    console.log("Starting database reset...")
    
    // Delete all data in correct order due to foreign key constraints
    console.log("Deleting match results...")
    await db.matchResult.deleteMany({})
    
    console.log("Deleting goals...")
    await db.goal.deleteMany({})
    
    console.log("Deleting matches...")
    await db.match.deleteMany({})
    
    console.log("Deleting players...")
    await db.player.deleteMany({})
    
    console.log("Deleting teams...")
    await db.team.deleteMany({})
    
    console.log("Deleting non-school days...")
    await db.nonSchoolDay.deleteMany({})
    
    console.log("Deleting leagues...")
    await db.league.deleteMany({})
    
    console.log("Deleting seasons...")
    await db.season.deleteMany({})
    
    console.log("Database reset completed successfully!")
    
    return NextResponse.json({ 
      message: "Database reset successfully. All data has been deleted.",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error resetting database:", error)
    return NextResponse.json({ 
      error: "Failed to reset database",
      details: error.message 
    }, { status: 500 })
  }
}