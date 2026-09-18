import { NextResponse } from 'next/server';
import { getFullFestDataFromDb } from '@/lib/dbQueries';
import { isDbConfigured, isDbAvailable } from '@/lib/db';
import { ensureDatabaseSeeded } from '@/lib/dbSeed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured() && (await isDbAvailable())) {
      try {
        await ensureDatabaseSeeded();
        const fullData = await getFullFestDataFromDb();
        return NextResponse.json({
          success: true,
          source: 'mysql',
          data: fullData,
        });
      } catch (dbErr: any) {
        console.error('[API /api/sync DB Error]', dbErr.message);
        return NextResponse.json({
          success: false,
          error: dbErr.message,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Hostinger MySQL database is not available or not configured',
    }, { status: 503 });
  } catch (error: any) {
    console.error('[API /api/sync Notice]', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

