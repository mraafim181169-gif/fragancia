import { NextResponse } from 'next/server';
import { getFullFestDataFromDb } from '@/lib/dbQueries';
import { isDbConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured()) {
      const fullData = await getFullFestDataFromDb();
      return NextResponse.json({
        success: true,
        source: 'mysql',
        data: fullData,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'unconfigured',
      message: 'Database environment variables not configured yet. Set DB_HOST, DB_USER, DB_NAME in .env',
      data: null,
    });
  } catch (error: any) {
    console.error('[API /api/sync GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
