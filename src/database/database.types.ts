import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './scheme';

export type DatabaseClient = LibSQLDatabase<typeof schema>;
