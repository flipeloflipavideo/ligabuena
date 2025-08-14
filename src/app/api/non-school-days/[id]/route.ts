import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { date, description } = body

    if (!date || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if non-school day exists
    const existingDay = await db.nonSchoolDay.findUnique({
      where: { id: params.id }
    })

    if (!existingDay) {
      return NextResponse.json({ error: "Non-school day not found" }, { status: 404 })
    }

    // Check if new date already exists for this season (excluding current day)
    if (date !== existingDay.date.toISOString().split('T')[0]) {
      const dateExists = await db.nonSchoolDay.findFirst({
        where: {
          date: new Date(date),
          seasonId: existingDay.seasonId,
          NOT: {
            id: params.id
          }
        }
      })

      if (dateExists) {
        return NextResponse.json({ 
          error: "Non-school day already exists for this date" 
        }, { status: 400 })
      }
    }

    // Update the non-school day
    const nonSchoolDay = await db.nonSchoolDay.update({
      where: { id: params.id },
      data: {
        date: new Date(date),
        description
      }
    })

    return NextResponse.json(nonSchoolDay)
  } catch (error) {
    console.error("Error updating non-school day:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if non-school day exists
    const nonSchoolDay = await db.nonSchoolDay.findUnique({
      where: { id: params.id }
    })

    if (!nonSchoolDay) {
      return NextResponse.json({ error: "Non-school day not found" }, { status: 404 })
    }

    // Delete the non-school day
    await db.nonSchoolDay.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Non-school day deleted successfully" })
  } catch (error) {
    console.error("Error deleting non-school day:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}