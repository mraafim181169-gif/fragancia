import { NextResponse } from 'next/server';
import { getProfilesFromDb } from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured()) {
      const profiles = await getProfilesFromDb();
      return NextResponse.json({ success: true, source: 'mysql', total: profiles.length, data: profiles });
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      total: 2,
      data: [
        { id: 'usr-admin', name: 'Fest Director (Admin)', email: 'admin@fragancia.local', role: 'ADMIN', createdAt: new Date().toISOString() },
        { id: 'usr-judge-1', name: 'Ustad Abdul Rahman (Chief Judge)', email: 'judge1@fragancia.local', role: 'JUDGE', createdAt: new Date().toISOString() },
      ],
    });
  } catch (error: any) {
    console.error('[API /api/profiles GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
