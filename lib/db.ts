import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

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
}

const globalForDb = globalThis as unknown as GlobalWithDb;

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_NAME
  );
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
    connectTimeout: 10000,
    // Support Hostinger / cloud MySQL SSL when specified
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

export function getDbPool(): Pool | null {
  if (!isDbConfigured()) {
    return null;
  }

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

/**
 * Executes a parameterized SELECT query against MySQL
 */
export async function query<T = RowDataPacket>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('Database is not configured. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in environment variables.');
  }

  try {
    const [rows] = await pool.query<any>(sql, params);
    return rows as T[];
  } catch (error: any) {
    console.error('[MySQL Query Error]', { sql, params, error: error.message });
    throw error;
  }
}

/**
 * Executes an INSERT, UPDATE, or DELETE parameterized query against MySQL
 */
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('Database is not configured. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME in environment variables.');
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (error: any) {
    console.error('[MySQL Execute Error]', { sql, params, error: error.message });
    throw error;
  }
}

/**
 * Health check test for database connectivity
 */
export async function checkDbConnection(): Promise<{ connected: boolean; error?: string; host?: string; database?: string }> {
  if (!isDbConfigured()) {
    return {
      connected: false,
      error: 'Environment variables DB_HOST, DB_USER, and DB_NAME are missing.',
    };
  }

  try {
    const pool = getDbPool();
    if (!pool) {
      return { connected: false, error: 'Failed to initialize MySQL pool' };
    }
    const [result] = await pool.query<RowDataPacket[]>('SELECT 1 as test, NOW() as current_time');
    return {
      connected: Array.isArray(result) && result.length > 0,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || 'Unknown database connection error',
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
    };
  }
}
