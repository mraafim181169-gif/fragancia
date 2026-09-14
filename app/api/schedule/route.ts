import { NextRequest, NextResponse } from 'next/server';
import {
  getScheduleFromDb,
  createScheduleItemInDb,
  updateScheduleItemInDb,
  deleteScheduleItemInDb,
} from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured()) {
      const schedule = await getScheduleFromDb();
      return NextResponse.json({ success: true, source: 'mysql', total: schedule.length, data: schedule });
    }

    const schedule = store.getSchedule();
    return NextResponse.json({ success: true, source: 'fallback', total: schedule.length, data: schedule });
  } catch (error: any) {
    console.error('[API /api/schedule GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, stage, date, time, status, category, competitionId } = body;

    if (!title || !stage || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'title, stage, date, and time are required' },
        { status: 400 }
      );
    }

    const id = body.id || `sch-${Date.now()}`;
    const scheduleItem = {
      id,
      title,
      stage,
      date,
      time,
      status: status || 'Upcoming',
      category: category || 'General',
      competitionId: competitionId || undefined,
    };

    if (isDbConfigured()) {
      await createScheduleItemInDb(scheduleItem);
      return NextResponse.json({ success: true, id, data: scheduleItem }, { status: 201 });
    }

    const created = store.createScheduleItem(scheduleItem);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/schedule POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Schedule item ID is required' }, { status: 400 });
    }

    if (isDbConfigured()) {
      await updateScheduleItemInDb(id, updates);
      return NextResponse.json({ success: true, message: 'Schedule item updated in MySQL' });
    }

    store.updateScheduleItem(id, updates);
    return NextResponse.json({ success: true, message: 'Schedule item updated' });
  } catch (error: any) {
    console.error('[API /api/schedule PUT Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Schedule item ID is required' }, { status: 400 });
    }

    if (isDbConfigured()) {
      await deleteScheduleItemInDb(id);
      return NextResponse.json({ success: true, message: 'Schedule item deleted from MySQL' });
    }

    store.deleteScheduleItem(id);
    return NextResponse.json({ success: true, message: 'Schedule item deleted' });
  } catch (error: any) {
    console.error('[API /api/schedule DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
