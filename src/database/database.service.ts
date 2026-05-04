import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from './database.constants';
import type { DatabaseClient } from './database.types';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DATABASE)
    readonly db: DatabaseClient,
  ) {}
}
