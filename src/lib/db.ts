import * as schema from '../../drizzle/schema';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';

let localDb: unknown = null;

export async function getDb() {
  try {
    // Try Cloudflare Workers D1 binding if running on Cloudflare
    const { env } = getCloudflareContext();
    if (env && (env as any).DB) {
      return drizzleD1((env as any).DB, { schema });
    }
  } catch (_e) {
    // Not running inside Cloudflare Workers request context (e.g. local dev / build)
  }

  // Fallback to local SQLite file via @libsql/client + drizzle-orm/libsql.
  // Both are loaded through eval() (hides the specifier from static bundler
  // analysis in esbuild/webpack) so this Node-only, natively-compiled stack
  // never gets pulled into the Cloudflare Workers bundle, where it's never
  // reached since D1 is always bound.
  if (!localDb) {
    const { drizzle } = await eval("import('drizzle-orm/libsql')");
    const { createClient } = await eval("import('@libsql/client')");
    const client = createClient({
      url: process.env.DATABASE_URL || 'file:sqlite.db',
    });
    localDb = drizzle(client, { schema });
  }

  return localDb as ReturnType<typeof drizzleD1>;
}
