import { NextResponse } from 'next/server';
import { checkDbConnection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await checkDbConnection();
  return NextResponse.json({
    status: result.connected ? 'healthy' : 'fallback_mode',
    mode: result.connected ? 'mysql_connected' : 'local_store_active',
    database: result,
    note: result.connected
      ? 'Connected to Hostinger MySQL database'
      : result.isCloudRunPreview
      ? "Running in preview mode with high-fidelity local memory store. When deployed on Hostinger, localhost connects directly to Hostinger's MySQL."
      : 'MySQL is currently unreachable. Operating in high-fidelity local store fallback mode.',
    timestamp: new Date().toISOString(),
  }, { status: 200 });
}

