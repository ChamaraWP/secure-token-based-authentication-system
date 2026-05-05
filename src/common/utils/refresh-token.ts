import * as argon2 from "argon2";

export const hashRefreshToken = async (token: string) => {
  return argon2.hash(token);
};

export const verifyRefreshToken = async (token: string, tokenHash: string) => {
  return argon2.verify(tokenHash, token);
};
