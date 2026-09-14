import { NextRequest, NextResponse } from 'next/server';
import {
  getSettingsFromDb,
  updateSettingsInDb,
  createAuditLogInDb,
} from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured()) {
      const settings = await getSettingsFromDb();
      if (settings) {
        return NextResponse.json({ success: true, source: 'mysql', data: settings });
      }
    }

    const settings = store.getSettings();
    return NextResponse.json({ success: true, source: 'fallback', data: settings });
  } catch (error: any) {
    console.error('[API /api/settings GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (isDbConfigured()) {
      await updateSettingsInDb(body);
      await createAuditLogInDb({
        id: `log-${Date.now()}`,
        action: 'SETTINGS_UPDATED',
        details: 'Updated fest settings in MySQL',
      });
      return NextResponse.json({ success: true, message: 'Settings updated in MySQL' });
    }

    store.updateSettings(body);
    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error: any) {
    console.error('[API /api/settings PUT Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
