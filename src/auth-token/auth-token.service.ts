import { Injectable } from "@nestjs/common";
import { refreshTokens } from "../database/scheme";
import {
  hashRefreshToken,
  verifyRefreshToken,
} from "../common/utils/refresh-token";
import { generateId } from "../common/utils/id";
import { InjectDatabase } from "../database/database.decorator";
import { eq } from "drizzle-orm";
import type { DatabaseClient } from "../database/database.types";

@Injectable()
export class AuthTokenService {
  constructor(@InjectDatabase() private readonly db: DatabaseClient) {}

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

  async findValidRefreshToken(rawToken: string) {
    const tokenRecords = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.revoked, false));

    for (const tokenRecord of tokenRecords) {
      const isMatch = await verifyRefreshToken(rawToken, tokenRecord.tokenHash);

      if (isMatch) {
        return tokenRecord;
      }
    }
    return undefined;
  }

  async revokeRefreshToken(tokenId: string, revokedByTokenId?: string) {
    await this.db
      .update(refreshTokens)
      .set({
        revoked: true,
        revokedAt: new Date(),
        replacedByTokenId: revokedByTokenId ?? null,
      })
      .where(eq(refreshTokens.id, tokenId));
  }

  async findRefreshTokenByRawToken(rawToken: string) {
    const tokenRecords = await this.db.select().from(refreshTokens);

    for (const tokenRecord of tokenRecords) {
      const isMatch = await verifyRefreshToken(rawToken, tokenRecord.tokenHash);

      if (isMatch) {
        return tokenRecord;
      }
    }
    return undefined;
  }

  async revokeRefreshTokensByFamily(familyId: string) {
    await this.db
      .update(refreshTokens)
      .set({
        revoked: true,
        revokedAt: new Date(),
      })
      .where(eq(refreshTokens.familyId, familyId));
  }
}
