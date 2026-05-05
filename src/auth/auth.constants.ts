import type { SignOptions } from "jsonwebtoken";

export const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? "dev-access-secret";

export const JWT_ACCESS_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m";

export const JWT_ISSUER = process.env.JWT_ISSUER ?? "nestjs-auth-learning";

export const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "nestjs-auth-client";

export const REFRESH_TOKEN_EXPIRES_IN_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 30,
);
