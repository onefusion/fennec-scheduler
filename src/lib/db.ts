import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../../drizzle/schema';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';

let localDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  try {
    // Try Cloudflare Pages D1 binding if running on Cloudflare Edge
    const ctx = getRequestContext();
    if (ctx && ctx.env && (ctx.env as any).DB) {
      return drizzleD1((ctx.env as any).DB, { schema });
    }
  } catch (_e) {
    // Not running inside Cloudflare Pages request context (e.g. local dev / build)
  }

  // Fallback to local SQLite file via @libsql/client
  if (!localDb) {
    const client = createClient({
      url: process.env.DATABASE_URL || 'file:sqlite.db',
    });
    localDb = drizzle(client, { schema });
  }

  return localDb;
}
