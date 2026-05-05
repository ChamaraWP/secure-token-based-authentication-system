import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { InjectDatabase } from '../database/database.decorator';
import type { DatabaseClient } from '../database/database.types';
import { users } from '../database/scheme';
import { User } from '../common/types/users/user.types';
import { generateId } from '../common/utils/id';
import { hashPassword } from '../common/utils/password';

@Injectable()
export class UsersService {
  constructor(@InjectDatabase() private readonly db: DatabaseClient) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async createUser(input: { email: string; password: string }): Promise<User> {
    const now = new Date();
    const passwordHash = await hashPassword(input.password);
    const newUser = {
      id: generateId(),
      email: input.email.toLocaleLowerCase().trim(),
      passwordHash,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    };
    await this.db.insert(users).values(newUser);
    return newUser;
  }

  async incrementTokenVersion(userId: string): Promise<void> {
    const user = await this.findById(userId);

    if (!user) {
      return;
    }

    await this.db
      .update(users)
      .set({ tokenVersion: user.tokenVersion + 1, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
