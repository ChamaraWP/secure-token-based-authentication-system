import { Injectable } from "@nestjs/common";
import { refreshTokens } from "../database/scheme";
import { hashRefreshToken } from "../common/utils/refresh-token";
import { generateId } from "../common/utils/id";
import { InjectDatabase } from "../database/database.decorator";

@Injectable()
export class AuthTokenService {
  constructor(@InjectDatabase() private readonly db) {}

  async createRefreshToken(input: {
    userId: string;
    rawToken: string;
    familyId?: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const now = new Date();
    const tokenRecord = {
      id: generateId(),
      userId: input.userId,
      tokenHash: await hashRefreshToken(input.rawToken),
      familyId: input.familyId ?? generateId(),
      replacedByTokenId: null,
      revoked: false,
      revokedAt: null,
      expiresAt: input.expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
      createdAt: now,
    };
    await this.db.insert(refreshTokens).values(tokenRecord);

    return tokenRecord;
  }
}
