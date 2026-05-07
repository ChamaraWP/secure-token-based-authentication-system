import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user";

export const refreshTokens = sqliteTable(
  "refresh_tokens",

  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()

      .references(() => users.id, { onDelete: "cascade" }),

    tokenHash: text("token_hash").notNull(),

    familyId: text("family_id").notNull(),

    replacedByTokenId: text("replaced_by_token_id"),

    revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),

    revokedAt: integer("revoked_at", { mode: "timestamp" }),

    revokedReason: text("revoked_reason"),

    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),

    userAgent: text("user_agent"),

    ipAddress: text("ip_address"),

    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },

  (table) => ({
    userIdIdx: index("refresh_tokens_user_id_idx").on(table.userId),

    familyIdIdx: index("refresh_tokens_family_id_idx").on(table.familyId),

    tokenHashIdx: index("refresh_tokens_token_hash_idx").on(table.tokenHash),
  }),
);
