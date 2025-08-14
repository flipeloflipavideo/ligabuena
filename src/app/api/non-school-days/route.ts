import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get('seasonId')

    if (!seasonId) {
      return NextResponse.json({ error: "Missing seasonId parameter" }, { status: 400 })
    }

    const nonSchoolDays = await db.nonSchoolDay.findMany({
      where: { seasonId },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(nonSchoolDays)
  } catch (error) {
    console.error("Error fetching non-school days:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, description, seasonId } = body

    if (!date || !description || !seasonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if date already exists for this season
    const existingDay = await db.nonSchoolDay.findFirst({
      where: {
        date: new Date(date),
        seasonId
      }
    })

    if (existingDay) {
      return NextResponse.json({ 
        error: "Non-school day already exists for this date" 
      }, { status: 400 })
    }

    // Check if season exists
    const season = await db.season.findUnique({
      where: { id: seasonId }
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Create the non-school day
    const nonSchoolDay = await db.nonSchoolDay.create({
      data: {
        date: new Date(date),
        description,
        seasonId
      }
    })

    return NextResponse.json(nonSchoolDay)
  } catch (error) {
    console.error("Error creating non-school day:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}