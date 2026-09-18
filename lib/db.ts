import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { execSync } from 'child_process';

/**
 * Reusable Server-Side MySQL Connection Pool for Fragancia Fest
 * Powered by mysql2/promise
 * 
 * Credentials are strictly read from server environment variables:
 * - DB_HOST
 * - DB_PORT
 * - DB_USER
 * - DB_PASSWORD
 * - DB_NAME
 * 
 * NEVER exposed to client-side code.
 */

interface GlobalWithDb {
  mysqlPool?: Pool;
  daemonChecked?: boolean;
}

const globalForDb = globalThis as unknown as GlobalWithDb;

function ensureLocalMysqlRunning(): void {
  if (globalForDb.daemonChecked) return;
  globalForDb.daemonChecked = true;

  const host = (process.env.DB_HOST || '').trim().toLowerCase();
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (!isLocalHost) return;

  try {
    execSync('mariadb-admin ping 2>/dev/null || (mkdir -p /var/run/mysqld && chown -R mysql:mysql /var/run/mysqld /var/lib/mysql 2>/dev/null && mariadbd-safe --user=mysql & sleep 2)', { stdio: 'ignore', timeout: 5000 });
  } catch {
    // Ignore errors if running in restricted environments
  }
}

/**
 * Checks whether MySQL configuration is present.
 */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
}

export function getPoolConfig(): PoolOptions {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 2000,
    // Support Hostinger / cloud MySQL SSL when specified
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export function getDbPool(): Pool | null {
  if (!isDbConfigured()) {
    return null;
  }

  ensureLocalMysqlRunning();

  if (!globalForDb.mysqlPool) {
    try {
      globalForDb.mysqlPool = mysql.createPool(getPoolConfig());
    } catch (err) {
      console.error('[MySQL] Error initializing connection pool:', err);
      return null;
    }
  }

  return globalForDb.mysqlPool;
}

interface DbStatusCache {
  tested: boolean;
  connected: boolean;
  lastChecked: number;
  lastError: string;
}

let dbStatusCache: DbStatusCache = {
  tested: false,
  connected: false,
  lastChecked: 0,
  lastError: '',
};

/**
 * Checks if the database is actively reachable with cached status to avoid connection stalls.
 */
export async function isDbAvailable(): Promise<boolean> {
  if (!isDbConfigured()) {
    return false;
  }

  const now = Date.now();
  // Fast cache: If checked within last 20 seconds and failed, return false immediately
  if (dbStatusCache.tested && !dbStatusCache.connected && (now - dbStatusCache.lastChecked < 20000)) {
    return false;
  }
  // If succeeded within last 60 seconds, return true
  if (dbStatusCache.tested && dbStatusCache.connected && (now - dbStatusCache.lastChecked < 60000)) {
    return true;
  }

  try {
    const pool = getDbPool();
    if (!pool) {
      dbStatusCache = { tested: true, connected: false, lastChecked: now, lastError: 'Could not create pool' };
      return false;
    }

    // Ping with short timeout (1500ms)
    await Promise.race([
      pool.query('SELECT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection probe timed out')), 1500)),
    ]);

    if (!dbStatusCache.connected) {
      console.log(`[MySQL] Successfully connected to database at ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    }

    dbStatusCache = { tested: true, connected: true, lastChecked: now, lastError: '' };
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || 'Connection failed';
    const isConnRefused = errorMsg.includes('ECONNREFUSED') || errorMsg.includes('timed out') || errorMsg.includes('ENOTFOUND');
    
    if (!dbStatusCache.tested || dbStatusCache.connected) {
      if (isConnRefused) {
        console.warn(`[MySQL Notice] Database at ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} is unreachable (${err?.code || errorMsg}). Operating in high-fidelity fallback mode for preview. When deployed on Hostinger, localhost connects directly to Hostinger MySQL.`);
      } else {
        console.warn(`[MySQL Notice] Database connection notice (${err?.code || errorMsg}). Operating in fallback mode.`);
      }
    }
    
    dbStatusCache = { tested: true, connected: false, lastChecked: now, lastError: errorMsg };
    return false;
  }
}

/**
 * Executes a parameterized SELECT query against MySQL
 */
export async function query<T = RowDataPacket>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('Database is not configured.');
  }

  try {
    const [rows] = await pool.query<any>(sql, params);
    return rows as T[];
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      dbStatusCache = { tested: true, connected: false, lastChecked: Date.now(), lastError: error.message };
    }
    if (error.code !== 'ECONNREFUSED') {
      console.error('[MySQL Query Error]', { sql, params, error: error.message });
    }
    throw error;
  }
}

/**
 * Executes an INSERT, UPDATE, or DELETE parameterized query against MySQL
 */
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('Database is not configured.');
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      dbStatusCache = { tested: true, connected: false, lastChecked: Date.now(), lastError: error.message };
    }
    if (error.code !== 'ECONNREFUSED') {
      console.error('[MySQL Execute Error]', { sql, params, error: error.message });
    }
    throw error;
  }
}

/**
 * Health check test for database connectivity
 */
export async function checkDbConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  isCloudRunPreview: boolean;
  error?: string;
  host?: string;
  database?: string;
}> {
  const isCloudRun = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_TIMEOUT_SECONDS);
  const configured = Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);

  if (!configured) {
    return {
      configured: false,
      connected: false,
      isCloudRunPreview: isCloudRun,
      error: 'Database environment variables DB_HOST, DB_USER, and DB_NAME are not set.',
    };
  }

  try {
    const pool = getDbPool();
    if (!pool) {
      return {
        configured: true,
        connected: false,
        isCloudRunPreview: isCloudRun,
        error: 'Failed to initialize MySQL pool',
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
      };
    }
    const [result] = await Promise.race([
      pool.query<RowDataPacket[]>('SELECT 1 as test, NOW() as cur_time'),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), 2000)),
    ]);
    return {
      configured: true,
      connected: Array.isArray(result) && result.length > 0,
      isCloudRunPreview: isCloudRun,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      isCloudRunPreview: isCloudRun,
      error: err.message || 'Unknown database connection error',
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    };
  }
}

