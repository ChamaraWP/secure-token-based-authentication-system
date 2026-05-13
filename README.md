# Secure Token-Based Authentication System

A production-style authentication system built with NestJS, Drizzle ORM, SQLite, JWT access tokens, rotating refresh tokens, reuse detection, session families, and secure cookie handling.

The goal of this project is not just to make authentication work, but to deeply understand:

- How JWT authentication actually works
- How refresh token rotation works internally
- How modern systems handle revocation and session management
- The trade-offs between stateless and stateful authentication
- Why systems like Auth0/Cognito use these patterns

---

# Architecture Overview

## Access Token

Short-lived JWT used for authenticated API requests.

Characteristics:

- Stateless
- Fast validation
- Sent via `Authorization` header
- Contains minimal identity data
- Expires quickly

Example:

```http
Authorization: Bearer <access-token>
```

JWT payload:

```json
{
  "sub": "user-id",
  "email": "test@example.com",
  "tv": 0,
  "jti": "token-id"
}
```

Claims:

| Claim | Meaning       |
| ----- | ------------- |
| `sub` | User ID       |
| `tv`  | Token version |
| `jti` | Unique JWT ID |

---

## Refresh Token

Long-lived opaque token used to generate new access tokens.

Characteristics:

- Random string (not JWT)
- Stored hashed in DB
- Rotated on every refresh
- Stored in HttpOnly cookie
- Used only for `/auth/refresh`

Example:

```txt
8f2a7d4b1f0f4d....
```

---

# Authentication Flow

## Login Flow

```txt
User logs in
    ↓
Validate email/password
    ↓
Generate access token (JWT)
    ↓
Generate refresh token (opaque token)
    ↓
Hash refresh token
    ↓
Store refresh token in DB
    ↓
Return access token
    ↓
Set refresh token as HttpOnly cookie
```

---

## Protected Route Flow

```txt
Request hits protected route
    ↓
JwtAuthGuard runs
    ↓
Passport uses JwtStrategy
    ↓
JWT signature/expiry verified
    ↓
JwtStrategy.validate() runs
    ↓
Compare payload.tv with user.tokenVersion
    ↓
Attach user to req.user
    ↓
Controller executes
```

---

## Refresh Flow

```txt
Browser sends refresh token cookie
    ↓
Find refresh token in DB
    ↓
Verify token hash
    ↓
Check revoked/expired state
    ↓
Generate new access token
    ↓
Generate new refresh token
    ↓
Store new refresh token
    ↓
Revoke old refresh token
    ↓
Return new access token
    ↓
Set new refresh cookie
```

---

# Refresh Token Rotation

Refresh tokens are single-use.

Example:

```txt
refreshTokenA → refreshTokenB → refreshTokenC
```

When token A is used:

```txt
A becomes revoked
B becomes active
```

This prevents stolen old refresh tokens from being reused.

---

# Refresh Token Reuse Detection

If a revoked token is used again:

```txt
refreshTokenA already revoked
        ↓
Used again
        ↓
Reuse detected
        ↓
Revoke entire token family
```

This is a strong indicator of token theft.

---

# Session Families

A session family represents one login chain.

Example:

```txt
Login
  ↓
Token A (family F1)
  ↓
Refresh
  ↓
Token B (family F1)
  ↓
Refresh
  ↓
Token C (family F1)
```

Different devices create different families.

Example:

```txt
Laptop → Family F1
Mobile → Family F2
```

This allows:

- Multi-device sessions
- Session-level revocation
- Reuse detection isolation

---

# Token Version (`tv`)

Each user has:

```txt
user.tokenVersion
```

Access token also contains:

```txt
payload.tv
```

During JWT validation:

```ts
if (user.tokenVersion !== payload.tv) {
  throw new UnauthorizedException();
}
```

This enables:

```txt
Logout all sessions instantly
```

Example:

```txt
DB tokenVersion = 1
JWT tv = 0

Mismatch → reject request
```

---

# Redis Access Token Denylist

JWT access tokens are stateless.

Normally:

```txt
Valid JWT works until expiry
```

Redis denylist allows immediate invalidation of one specific access token.

Flow:

```txt
Logout current session
    ↓
Store JWT jti in Redis denylist
    ↓
JwtStrategy checks Redis
    ↓
If jti exists → reject request
```

Redis key example:

```txt
access-token-denylist:abc-123
```

TTL is used so denylist entries disappear automatically after token expiry.

---

# Cookie-Based Refresh Tokens

Refresh token is stored in:

```txt
HttpOnly Secure Cookie
```

Why?

Because:

```txt
JavaScript cannot access HttpOnly cookies
```

This reduces refresh token theft via XSS.

Cookie settings:

```ts
{
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/auth/refresh'
}
```

---

# Why `path: '/auth/refresh'` Matters

The browser only sends the refresh token cookie to:

```txt
/auth/refresh
```

Instead of every request.

Benefits:

- Reduced attack surface
- Less unnecessary cookie exposure
- Cleaner separation of concerns

---

# Why `clearCookie()` Is Needed

Logout revokes token in DB.

But browser still stores the refresh cookie.

So logout also sends:

```ts
res.clearCookie("refreshToken", {
  path: "/auth/refresh",
});
```

This tells browser:

```txt
Delete refresh token cookie
```

---

# Why Services Throw Exceptions

Business logic lives in services.

Example:

```ts
throw new UnauthorizedException();
```

Controllers stay thin:

```ts
return this.authService.login(body);
```

NestJS automatically converts exceptions into HTTP responses.

---

# Why AuthModule Imports UsersModule

NestJS modules are isolated.

Even if both modules exist inside `AppModule`, they cannot access each other automatically.

Correct setup:

```ts
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

```ts
@Module({
  imports: [UsersModule],
})
export class AuthModule {}
```

---

# How JwtAuthGuard and JwtStrategy Are Linked

The link is handled internally by Passport.

Guard:

```ts
AuthGuard("jwt");
```

Strategy:

```ts
PassportStrategy(Strategy);
```

Passport registers strategy under the name:

```txt
jwt
```

So:

```txt
AuthGuard('jwt')
    ↓
Passport finds JwtStrategy
```

---

# Current Feature Set

Implemented:

- JWT access tokens
- Refresh token rotation
- Refresh token reuse detection
- Session families
- Session revocation
- Logout all sessions
- Token version invalidation
- Redis access-token denylist
- Secure HttpOnly refresh cookies
- Rate limiting
- Device/session metadata
- Active session listing

---

# Tech Stack

- NestJS
- Drizzle ORM
- SQLite
- Passport
- JWT
- Redis
- Argon2

---

# Security Concepts Covered

This project demonstrates:

- Stateless authentication
- Stateful revocation
- Session isolation
- Refresh token rotation
- Reuse detection
- JWT validation pipeline
- HttpOnly cookie security
- Access token denylisting
- Token theft mitigation
- Brute-force protection

---

# Future Improvements

Potential next steps:

- Redis-backed distributed rate limiting
- Device fingerprinting
- Email verification
- MFA / TOTP
- OAuth providers
- WebAuthn / Passkeys
- Session activity tracking
- Audit logs
- RBAC / permissions
- CSRF protection enhancements
- Token lookup optimization

---

# Learning Goal

This project exists to deeply understand the internals and trade-offs of modern authentication systems rather than treating authentication as a black box.
