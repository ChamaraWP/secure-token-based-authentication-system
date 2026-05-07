export type JwtPayload = {
  sub: string; // user id
  email: string;
  tv: number; // token version
  jti: string; // JWT ID for refresh token rotation
};
