import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAvailableDates } from "@/lib/date-utils";

interface MatchPairing {
  homeTeamId: string;
  awayTeamId: string;
  round: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, startDate } = body;

    if (!leagueId || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const league = await db.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: { orderBy: { name: "asc" } },
        season: { include: { nonSchoolDays: true } }
      }
    });

    if (!league) {
      return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    if (league.teams.length < 2) {
      return NextResponse.json({ error: "Need at least 2 teams to generate matches" }, { status: 400 });
    }

    const existingMatches = await db.match.findMany({ where: { leagueId } });
    if (existingMatches.length > 0) {
      return NextResponse.json({ error: "Matches already exist for this league. Delete existing matches first." }, { status: 400 });
    }

    const teams = league.teams;
    const totalTeams = teams.length;

    const seasonStart = new Date(league.season.startDate);
    const seasonEnd = new Date(league.season.endDate);
    const requestedStart = new Date(startDate);

    const scheduleStart = requestedStart > seasonStart ? requestedStart : seasonStart;

    const availableDates = getAvailableDates(
      scheduleStart,
      seasonEnd,
      league.season.nonSchoolDays,
      [5],
      Math.ceil(teams.length / 2)
    );

    if (availableDates.length === 0) {
      return NextResponse.json({ error: "No available dates found for scheduling matches." }, { status: 400 });
    }

    const matchesPerTeamPerCycle = (totalTeams - 1) * 2;
    const totalMatchesPerCycle = (totalTeams * matchesPerTeamPerCycle) / 2;
    const maxMatchesPerDay = Math.ceil(teams.length / 2);
    const daysNeededPerCycle = Math.ceil(totalMatchesPerCycle / maxMatchesPerDay);
    const totalCycles = Math.floor(availableDates.length / daysNeededPerCycle);

    const scheduledMatches = [];
    let dateIndex = 0;
    let totalMatchesScheduled = 0;

    for (let cycle = 0; cycle < totalCycles && dateIndex < availableDates.length; cycle++) {
      const cycleMatches: MatchPairing[] = [];
      let matchCounter = 1;

      for (let i = 0; i < totalTeams; i++) {
        for (let j = 0; j < totalTeams; j++) {
          if (i !== j) {
            cycleMatches.push({
              homeTeamId: teams[i].id,
              awayTeamId: teams[j].id,
              round: matchCounter++
            });
          }
        }
      }

      let matchIndex = 0;
      let cycleDateIndex = 0;

      while (matchIndex < cycleMatches.length && cycleDateIndex < daysNeededPerCycle && dateIndex < availableDates.length) {
        const currentDate = availableDates[dateIndex];
        const matchesOnThisDate = [];

        const maxMatchesToday = Math.min(
          currentDate.availableSlots,
          cycleMatches.length - matchIndex,
          maxMatchesPerDay
        );

        for (let i = 0; i < maxMatchesToday; i++) {
          if (matchIndex < cycleMatches.length) {
            const match = cycleMatches[matchIndex];
            matchesOnThisDate.push({
              leagueId,
              homeTeamId: match.homeTeamId,
              awayTeamId: match.awayTeamId,
              matchDate: new Date(
                currentDate.date.getFullYear(),
                currentDate.date.getMonth(),
                currentDate.date.getDate(),
                12,
                0,
                0
              ),
              venue: `${league.name} - Cancha ${i + 1}`,
              round: match.round,
              cycle: cycle + 1
            });
            matchIndex++;
            totalMatchesScheduled++;
          }
        }

        scheduledMatches.push(...matchesOnThisDate);
        dateIndex++;
        cycleDateIndex++;
      }
    }

    if (totalMatchesScheduled === 0) {
      return NextResponse.json({ error: "No matches were scheduled." }, { status: 400 });
    }

    await db.match.createMany({
      data: scheduledMatches.map(match => ({
        leagueId: match.leagueId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        matchDate: match.matchDate,
        venue: match.venue
      }))
    });

    const allMatchesWithDetails = await db.match.findMany({
      where: { leagueId },
      include: {
        homeTeam: true,
        awayTeam: true,
        result: {
          include: {
            goals: { include: { player: true } }
          }
        }
      },
      orderBy: { matchDate: "asc" }
    });

    const summary = {
      totalMatches: allMatchesWithDetails.length,
      totalTeams: teams.length,
      seasonDates: { start: league.season.startDate, end: league.season.endDate },
      scheduledDates: {
        first: scheduledMatches[0]?.matchDate,
        last: scheduledMatches[scheduledMatches.length - 1]?.matchDate
      },
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        homeMatches: allMatchesWithDetails.filter(m
