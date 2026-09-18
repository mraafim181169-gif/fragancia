import { NextRequest, NextResponse } from 'next/server';
import {
  getPointAdjustmentsFromDb,
  createPointAdjustmentInDb,
  deletePointAdjustmentInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adjustments = await getPointAdjustmentsFromDb();
    return NextResponse.json({ success: true, source: 'mysql', total: adjustments.length, data: adjustments });
  } catch (error: any) {
    console.error('[API /api/point-adjustments GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, points, reason, createdBy } = body;

    if (!teamId || points === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: 'teamId, points, and reason are required' },
        { status: 400 }
      );
    }

    const id = body.id || `adj-${Date.now()}`;
    const adjRecord = {
      id,
      teamId,
      teamName: body.teamName || '',
      points: Number(points),
      reason,
      createdAt: new Date().toISOString(),
      createdBy: createdBy || 'admin@fragancia.local',
    };

    await createPointAdjustmentInDb(adjRecord);
    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'POINT_ADJUSTMENT',
      details: `Applied ${points > 0 ? `+${points}` : points} points to team ${teamId}: "${reason}" in MySQL`,
      user: createdBy,
    });
    return NextResponse.json({ success: true, id, data: adjRecord }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/point-adjustments POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Adjustment ID is required' }, { status: 400 });
    }

    await deletePointAdjustmentInDb(id);
    return NextResponse.json({ success: true, message: 'Point adjustment deleted from MySQL' });
  } catch (error: any) {
    console.error('[API /api/point-adjustments DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
