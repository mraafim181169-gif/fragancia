import { NextResponse } from 'next/server';
import { getScoreboardDataFromDb } from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured()) {
      const scoreboard = await getScoreboardDataFromDb();
      return NextResponse.json({
        success: true,
        source: 'mysql',
        teams: scoreboard.teams,
        individualChampions: scoreboard.topStudents,
        totalCompetitions: scoreboard.totalCompetitions,
        completedCompetitions: scoreboard.completedCompetitions,
        lastUpdated: scoreboard.lastUpdated,
      });
    }

    // Fallback if MySQL is not yet configured
    const teams = store.getTeams();
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
    const students = store.getStudents();
    const topStudents = [...students]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      source: 'fallback',
      teams: sortedTeams,
      individualChampions: topStudents,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/scoreboard GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
