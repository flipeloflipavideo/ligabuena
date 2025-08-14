import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Obtener un partido por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const match = await db.match.findUnique({
      where: { id: params.id },
      include: {
        homeTeam: true,
        awayTeam: true,
        result: { include: { goals: { include: { player: true } } } },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Actualizar un partido por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const updatedMatch = await db.match.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Eliminar un partido por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.match.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
