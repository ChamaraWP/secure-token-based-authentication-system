import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from '../../../database/scheme/user';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
