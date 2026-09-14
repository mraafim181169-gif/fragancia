import { NextResponse } from 'next/server';
import { checkDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await checkDbConnection();
  return NextResponse.json({
    status: result.connected ? 'healthy' : 'database_unreachable',
    database: result,
    timestamp: new Date().toISOString(),
  }, { status: result.connected ? 200 : 503 });
}
