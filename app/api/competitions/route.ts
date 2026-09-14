import { NextRequest, NextResponse } from 'next/server';
import {
  getCompetitionsFromDb,
  createCompetitionInDb,
  updateCompetitionInDb,
  deleteCompetitionInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured()) {
      const competitions = await getCompetitionsFromDb();
      return NextResponse.json({
        success: true,
        source: 'mysql',
        total: competitions.length,
        data: competitions,
      });
    }

    const competitions = store.getCompetitions();
    return NextResponse.json({
      success: true,
      source: 'fallback',
      total: competitions.length,
      data: competitions,
    });
  } catch (error: any) {
    console.error('[API /api/competitions GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, categoryId, type, stageType, maxParticipants, timeLimit, firstPlacePoints, secondPlacePoints, thirdPlacePoints } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ success: false, error: 'Name and Category ID are required' }, { status: 400 });
    }

    const compId = body.id || `comp-${Date.now()}`;
    const compData = {
      id: compId,
      name,
      type: type || 'Single',
      categoryId,
      categoryName: body.categoryName || '',
      stageType: stageType || 'On Stage',
      maxParticipants: maxParticipants ?? 20,
      timeLimit: timeLimit || '7 Mins',
      rules: body.rules || '',
      firstPlacePoints: firstPlacePoints ?? 10,
      secondPlacePoints: secondPlacePoints ?? 7,
      thirdPlacePoints: thirdPlacePoints ?? 5,
      status: body.status || 'Upcoming',
      stage: body.stage || (stageType === 'Off Stage' ? '' : 'Main Stage'),
      startTime: body.startTime || '10:00 AM',
      scheduledTime: body.scheduledTime || body.startTime || '10:00 AM',
      durationMinutes: body.durationMinutes || 10,
      scoringCriteria: body.scoringCriteria || [
        { id: 'sc-1', name: 'Pronunciation', maxScore: 30 },
        { id: 'sc-2', name: 'Melody & Tone', maxScore: 30 },
        { id: 'sc-3', name: 'Fluency', maxScore: 20 },
        { id: 'sc-4', name: 'Presentation', maxScore: 20 },
      ],
      resultStatus: body.resultStatus || 'Draft',
      publishedAt: body.publishedAt || null,
    };

    if (isDbConfigured()) {
      await createCompetitionInDb(compData as any);
      await createAuditLogInDb({
        id: `log-${Date.now()}`,
        action: 'COMPETITION_CREATED',
        details: `Created competition ${name} in MySQL`,
      });
      return NextResponse.json({ success: true, id: compId, data: compData }, { status: 201 });
    }

    const created = store.createCompetition(compData as any);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/competitions POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Competition ID is required' }, { status: 400 });
    }

    if (isDbConfigured()) {
      await updateCompetitionInDb(id, updates);
      return NextResponse.json({ success: true, message: 'Competition updated in MySQL' });
    }

    store.updateCompetition(id, updates);
    return NextResponse.json({ success: true, message: 'Competition updated' });
  } catch (error: any) {
    console.error('[API /api/competitions PUT Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Competition ID is required' }, { status: 400 });
    }

    if (isDbConfigured()) {
      await deleteCompetitionInDb(id);
      await createAuditLogInDb({
        id: `log-${Date.now()}`,
        action: 'COMPETITION_DELETED',
        details: `Deleted competition ${id} from MySQL`,
      });
      return NextResponse.json({ success: true, message: 'Competition deleted from MySQL' });
    }

    store.deleteCompetition(id);
    return NextResponse.json({ success: true, message: 'Competition deleted' });
  } catch (error: any) {
    console.error('[API /api/competitions DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
