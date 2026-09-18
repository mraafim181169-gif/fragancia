import { NextRequest, NextResponse } from 'next/server';
import { getScoreboardDataFromDb, resetScoreboardPointsInDb } from '@/lib/dbQueries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const scoreboard = await getScoreboardDataFromDb();
    return NextResponse.json({
      success: true,
      source: 'mysql',
      teams: scoreboard.teams,
      students: scoreboard.students,
      individualChampions: scoreboard.topStudents,
      totalCompetitions: scoreboard.totalCompetitions,
      completedCompetitions: scoreboard.completedCompetitions,
      lastUpdated: scoreboard.lastUpdated,
    });
  } catch (error: any) {
    console.error('[API /api/scoreboard GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = (body.action || '').toLowerCase();
    if (
      action === 'reset' ||
      action === 'clear_all_points' ||
      action === 'reset_scores' ||
      action === 'reset_scoreboard'
    ) {
      await resetScoreboardPointsInDb();
      const freshScoreboard = await getScoreboardDataFromDb();
      return NextResponse.json({
        success: true,
        message: 'All scoreboard points, marks, and published results have been cleared in MySQL. Scoreboard is now fresh.',
        scoreboard: freshScoreboard,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/scoreboard POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
