import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { refreshTokens } from "../../database/scheme";

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;
