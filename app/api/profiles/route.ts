import { NextResponse } from 'next/server';
import { getProfilesFromDb } from '@/lib/dbQueries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profiles = await getProfilesFromDb();
    return NextResponse.json({ success: true, source: 'mysql', total: profiles.length, data: profiles });
  } catch (error: any) {
    console.error('[API /api/profiles GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
