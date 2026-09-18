import { NextRequest, NextResponse } from 'next/server';
import {
  getTeamsFromDb,
  createTeamInDb,
  updateTeamInDb,
  deleteTeamInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teams = await getTeamsFromDb();
    return NextResponse.json({ success: true, source: 'mysql', total: teams.length, data: teams });
  } catch (error: any) {
    console.error('[API /api/teams GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, shortCode, color, description, captain, viceCaptain } = body;

    if (!name || !shortCode) {
      return NextResponse.json({ success: false, error: 'Name and Short Code are required' }, { status: 400 });
    }

    const id = body.id || `team-${Date.now()}`;

    await createTeamInDb({
      id,
      name,
      shortCode,
      color: color || '#0A0A0A',
      description,
      captain,
      viceCaptain,
      active: true,
    });

    await createAuditLogInDb({
      id: `log-${Date.now()}`,
      action: 'TEAM_CREATED',
      details: `Created team ${name} (${shortCode}) in MySQL`,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/teams POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    await updateTeamInDb(id, updates);
    return NextResponse.json({ success: true, message: 'Team updated in MySQL' });
  } catch (error: any) {
    console.error('[API /api/teams PUT Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    await deleteTeamInDb(id);
    return NextResponse.json({ success: true, message: 'Team deleted from MySQL' });
  } catch (error: any) {
    console.error('[API /api/teams DELETE Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
