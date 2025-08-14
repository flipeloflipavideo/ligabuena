import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await db.$executeRaw`SELECT 1`;
    
    // Get basic stats
    const stats = {
      seasons: await db.season.count(),
      leagues: await db.league.count(),
      teams: await db.team.count(),
      players: await db.player.count(),
      matches: await db.match.count(),
      goals: await db.goal.count(),
    };
    
    return NextResponse.json({ 
      message: "Good!",
      database: "PostgreSQL (Neon)",
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      message: "Error", 
      error: error.message 
    }, { status: 500 });
  }
}