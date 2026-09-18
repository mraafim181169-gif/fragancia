import { NextRequest, NextResponse } from 'next/server';
import {
  getRegistrationsFromDb,
  createRegistrationInDb,
  updateRegistrationCodeLetterInDb,
  updateRegistrationStatusInDb,
  deleteRegistrationInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get('competitionId') || undefined;
    const studentId = searchParams.get('studentId') || undefined;

    const registrations = await getRegistrationsFromDb({ competitionId, studentId });
    return NextResponse.json({
      success: true,
      source: 'mysql',
      total: registrations.length,
      data: registrations,
    });
  } catch (error: any) {
    console.error('[API /api/registrations GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { competitionId, studentId, codeLetter, status } = body;

    if (!competitionId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'competitionId and studentId are required' },
        { status: 400 }
      );
    }

    const regId = body.id || `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const regRecord = {
      id: regId,
      competitionId,
      competitionName: body.competitionName || '',
      studentId,
      studentName: body.studentName || '',
      chestNumber: body.chestNumber || '',
      codeLetter: (codeLetter || '').trim().toUpperCase(),
      teamId: body.teamId || '',
      teamName: body.teamName || '',
      categoryId: body.categoryId || '',
      status: status || 'Registered',
      registeredAt: new Date().toISOString(),
    };

    await createRegistrationInDb(regRecord as any);
    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'STUDENT_REGISTERED',
      details: `Registered participant for competition ${competitionId} (Code: ${regRecord.codeLetter}) in MySQL`,
    });
    return NextResponse.json({ success: true, id: regId, data: regRecord }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/registrations POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, codeLetter, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Registration ID is required' }, { status: 400 });
    }

    if (codeLetter !== undefined) {
      await updateRegistrationCodeLetterInDb(id, codeLetter);
    }
    if (status !== undefined) {
      await updateRegistrationStatusInDb(id, status);
    }
    return NextResponse.json({ success: true, message: 'Registration updated in MySQL' });
  } catch (error: any) {
    console.error('[API /api/registrations PUT Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Registration ID is required' }, { status: 400 });
    }

    await deleteRegistrationInDb(id);
    return NextResponse.json({ success: true, message: 'Registration removed from MySQL' });
  } catch (error: any) {
    console.error('[API /api/registrations DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
