import { NextRequest, NextResponse } from 'next/server';
import {
  getAttendanceFromDb,
  markAttendanceInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get('competitionId') || undefined;

    if (isDbConfigured()) {
      const attendance = await getAttendanceFromDb(competitionId);
      return NextResponse.json({
        success: true,
        source: 'mysql',
        total: attendance.length,
        data: attendance,
      });
    }

    const attendance = competitionId
      ? store.getCompetitionAttendance(competitionId)
      : store.getAttendance();

    return NextResponse.json({
      success: true,
      source: 'fallback',
      total: attendance.length,
      data: attendance,
    });
  } catch (error: any) {
    console.error('[API /api/attendance GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { competitionId, studentId, chestNumber, status } = body;

    if (!competitionId || !studentId || !status) {
      return NextResponse.json(
        { success: false, error: 'competitionId, studentId, and status are required' },
        { status: 400 }
      );
    }

    const id = body.id || `att-${Date.now()}-${studentId}`;

    if (isDbConfigured()) {
      await markAttendanceInDb({
        id,
        competitionId,
        studentId,
        status: status as 'Present' | 'Absent',
      });

      return NextResponse.json({
        success: true,
        message: `Attendance marked as ${status} in MySQL`,
        record: { id, competitionId, studentId, chestNumber, status },
      });
    }

    store.markAttendance(competitionId, studentId, chestNumber || '', status as 'Present' | 'Absent');
    return NextResponse.json({ success: true, message: `Attendance marked as ${status}` });
  } catch (error: any) {
    console.error('[API /api/attendance POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
