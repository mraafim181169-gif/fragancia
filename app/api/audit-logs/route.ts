import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogsFromDb, createAuditLogInDb } from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;

    if (isDbConfigured()) {
      const logs = await getAuditLogsFromDb(limit);
      return NextResponse.json({ success: true, source: 'mysql', total: logs.length, data: logs });
    }

    const logs = store.getAuditLogs().slice(0, limit);
    return NextResponse.json({ success: true, source: 'fallback', total: logs.length, data: logs });
  } catch (error: any) {
    console.error('[API /api/audit-logs GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, details, user } = body;

    if (!action || !details) {
      return NextResponse.json({ success: false, error: 'action and details are required' }, { status: 400 });
    }

    const id = body.id || `log-${Date.now()}`;

    if (isDbConfigured()) {
      await createAuditLogInDb({ id, action, details, user });
      return NextResponse.json({ success: true, id }, { status: 201 });
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/audit-logs POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
