import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Record<string, string>;
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const body = await request.json();
    const { homeScore, awayScore, goals } = body;

    if (homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const match = await db.match.findUnique({
      where: { id: params.id },
      include: {
        result: {
          include: {
            goals: { include: { player: true } }
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    let matchResult;
    if (match.result) {
      matchResult = await db.matchResult.update({
        where: { id: match.result.id },
        data: { homeScore, awayScore }
      });
      await db.goal.deleteMany({ where: { matchResultId: match.result.id } });
    } else {
      matchResult = await db.matchResult.create({
        data: { matchId: params.id, homeScore, awayScore }
      });
    }

    if (goals && goals.length > 0) {
      await Promise.all(
        goals.map((goal: any) =>
          db.goal.create({
            data: {
              playerId: goal.playerId,
              matchResultId: matchResult.id,
              minute: goal.minute
            }
          })
        )
      );
    }

    await db.match.update({
      where: { id: params.id },
      data: { isCompleted: true }
    });

    const updatedMatch = await db.match.findUnique({
      where: { id: params.id },
      include: {
        homeTeam: true,
        awayTeam: true,
        result: {
          include: {
            goals: { include: { player: true } }
          }
        }
      }
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("Error updating match result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const match = await db.match.findUnique({
      where: { id: params.id },
      include: {
        result: { include: { goals: true } }
      }
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.result) {
      await db.goal.deleteMany({ where: { matchResultId: match.result.id } });
      await db.matchResult.delete({ where: { id: match.result.id } });
    }

    await db.match.delete({ where: { id: params.id } });

    return NextResponse.json({
      message: "Match deleted successfully",
      deletedMatchId: params.id
    });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
