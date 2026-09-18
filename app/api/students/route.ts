import { NextRequest, NextResponse } from 'next/server';
import {
  getStudentsFromDb,
  createStudentInDb,
  updateStudentInDb,
  deleteStudentInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    const students = await getStudentsFromDb({ teamId, categoryId });
    return NextResponse.json({
      success: true,
      source: 'mysql',
      total: students.length,
      data: students,
    });
  } catch (error: any) {
    console.error('[API /api/students GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, fullName, admissionNo, teamId, categoryId, phone, chestNumber, gender, role, photo } = body;

    if (!fullName || !admissionNo || !teamId || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required student fields (fullName, admissionNo, teamId, categoryId)' },
        { status: 400 }
      );
    }

    const studentId = id || `stu-${Date.now()}`;
    const studentChest = chestNumber || `GEN-${Date.now().toString().slice(-3)}`;

    await createStudentInDb({
      id: studentId,
      fullName,
      admissionNo,
      chestNumber: studentChest,
      teamId,
      teamName: body.teamName || '',
      teamCode: body.teamCode || '',
      categoryId,
      categoryName: body.categoryName || '',
      phone: phone || '',
      gender: gender || 'Male',
      role: role || 'Member',
      photo: photo || undefined,
      status: 'Active',
    });

    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'STUDENT_ADDED',
      details: `Enrolled student ${fullName} [${studentChest}] into MySQL database`,
      user: body.userEmail || 'admin@fragancia.local',
    });

    return NextResponse.json({
      success: true,
      id: studentId,
      chestNumber: studentChest,
      data: {
        id: studentId,
        fullName,
        admissionNo,
        chestNumber: studentChest,
        teamId,
        categoryId,
        gender: gender || 'Male',
        role: role || 'Member',
        status: 'Active',
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/students POST Error]', error);
    const isDuplicate = error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry');
    return NextResponse.json(
      { success: false, error: isDuplicate ? 'Admission Number or Chest Number already exists in MySQL' : error.message },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required for update' }, { status: 400 });
    }

    await updateStudentInDb(id, updates);
    return NextResponse.json({ success: true, message: 'Student updated in MySQL' });
  } catch (error: any) {
    console.error('[API /api/students PUT Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    await deleteStudentInDb(id);
    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'STUDENT_DELETED',
      details: `Deleted student ${id} from MySQL`,
    });
    return NextResponse.json({ success: true, message: 'Student deleted from MySQL' });
  } catch (error: any) {
    console.error('[API /api/students DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
