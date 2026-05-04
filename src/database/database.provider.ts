import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { DATABASE } from './database.constants';
import * as schema from './schema';

const DEFAULT_DATABASE_URL = 'file:./data/dev.sqlite';

function ensureLocalSqliteDirectory(databaseUrl: string): void {
  if (!databaseUrl.startsWith('file:')) {
    return;
  }

  const filePath = databaseUrl.slice('file:'.length);
  const directory = dirname(filePath);

  mkdirSync(resolve(process.cwd(), directory), { recursive: true });
}

export const databaseProviders = [
  {
    provide: DATABASE,
    useFactory: async () => {
      const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

      ensureLocalSqliteDirectory(databaseUrl);

      const client = createClient({ url: databaseUrl });
      const db = drizzle(client, { schema });

      await migrate(db, {
        migrationsFolder: resolve(process.cwd(), 'drizzle'),
      });

      return db;
    },
  },
];
