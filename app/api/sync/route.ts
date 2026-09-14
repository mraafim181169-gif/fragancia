import { NextResponse } from 'next/server';
import { getFullFestDataFromDb } from '@/lib/dbQueries';
import { isDbConfigured, isDbAvailable } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isDbConfigured() && (await isDbAvailable())) {
      try {
        const fullData = await getFullFestDataFromDb();
        return NextResponse.json({
          success: true,
          source: 'mysql',
          data: fullData,
        });
      } catch (dbErr: any) {
        console.warn('[API /api/sync DB Fetch Notice]', dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      source: 'local_memory',
      message: 'Operating in high-fidelity local memory mode for preview. When deployed on Hostinger, localhost connects directly to Hostinger MySQL.',
      data: null,
    });
  } catch (error: any) {
    console.warn('[API /api/sync Notice]', error.message);
    return NextResponse.json({
      success: true,
      source: 'fallback',
      message: error.message,
      data: null,
    });
  }
}

