import { Inject, Injectable } from '@nestjs/common';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { DATABASE } from './database.constants';
import * as schema from './scheme';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DATABASE)
    readonly db: LibSQLDatabase<typeof schema>,
  ) {}
}
