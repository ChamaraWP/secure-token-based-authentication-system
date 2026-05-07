export const revokedReasons = {
  logout: "logout",
  logout_all: "logout_all",
  rotation: "rotation",
  reuse_detected: "reuse_detected",
  session_revoked: "session_revoked",
  expired: "expired",
} as const;

export type RevokedReason =
  (typeof revokedReasons)[keyof typeof revokedReasons];
