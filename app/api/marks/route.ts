import { NextRequest, NextResponse } from 'next/server';
import {
  getMarksFromDb,
  saveJudgeMarkInDb,
  deleteJudgeMarkInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';
import { calculateGradeFromScore } from '@/types/fest';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get('competitionId') || undefined;

    const marks = await getMarksFromDb(competitionId);
    return NextResponse.json({
      success: true,
      source: 'mysql',
      total: marks.length,
      data: marks,
    });
  } catch (error: any) {
    console.error('[API /api/marks GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { competitionId, studentId, judgeName, scores, totalScore, maxScore, grade, feedback, chestNumber, codeLetter } = body;

    if (!competitionId || !studentId || !judgeName || totalScore === undefined) {
      return NextResponse.json(
        { success: false, error: 'competitionId, studentId, judgeName, and totalScore are required' },
        { status: 400 }
      );
    }

    const computedGrade = grade || calculateGradeFromScore(Number(totalScore), Number(maxScore || 100));
    const markId = body.id || `jm-${Date.now()}`;

    const markRecord = {
      id: markId,
      competitionId,
      studentId,
      chestNumber: chestNumber || '',
      codeLetter: codeLetter || '',
      judgeName,
      scores: scores || {},
      totalScore: Number(totalScore),
      grade: computedGrade,
      maxScore: Number(maxScore || 100),
      feedback: feedback || '',
      submittedAt: new Date().toISOString(),
    };

    await saveJudgeMarkInDb(markRecord);
    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'MARK_SAVED',
      details: `Saved judge mark (${totalScore} pts, Grade ${computedGrade}) in MySQL for student ${studentId}`,
    });
    return NextResponse.json({ success: true, id: markId, data: markRecord }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/marks POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Mark ID is required' }, { status: 400 });
    }

    await deleteJudgeMarkInDb(id);
    return NextResponse.json({ success: true, message: 'Judge mark deleted from MySQL' });
  } catch (error: any) {
    console.error('[API /api/marks DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
