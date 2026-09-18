import { NextRequest, NextResponse } from 'next/server';
import {
  getCompetitionResultsFromDb,
  saveCompetitionResultInDb,
  unpublishCompetitionResultInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await getCompetitionResultsFromDb();
    return NextResponse.json({ success: true, source: 'mysql', total: results.length, data: results });
  } catch (error: any) {
    console.error('[API /api/results GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { competitionId, rankings, status } = body;

    if (!competitionId) {
      return NextResponse.json({ success: false, error: 'competitionId is required' }, { status: 400 });
    }

    const resId = body.id || `res-${competitionId}`;
    const resRecord = {
      id: resId,
      competitionId,
      competitionName: body.competitionName || '',
      rankings: rankings || [],
      status: (status || 'Published') as 'Draft' | 'Published',
      publishedAt: status === 'Published' ? new Date().toISOString() : null,
    };

    await saveCompetitionResultInDb(resRecord);
    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'RESULT_PUBLISHED',
      details: `Published results for competition ${competitionId} in MySQL`,
    });
    return NextResponse.json({ success: true, id: resId, data: resRecord }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/results POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get('competitionId');

    if (!competitionId) {
      return NextResponse.json({ success: false, error: 'competitionId is required' }, { status: 400 });
    }

    await unpublishCompetitionResultInDb(competitionId);
    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'RESULT_UNPUBLISHED',
      details: `Withdrew published result for competition ${competitionId} in MySQL`,
    });
    return NextResponse.json({ success: true, message: 'Result unpublished in MySQL' });
  } catch (error: any) {
    console.error('[API /api/results DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
