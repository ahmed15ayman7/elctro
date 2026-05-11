import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface AccessTokenPayload {
  sub: string;   // user id
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  sub: string;   // user id
  jti: string;   // unique token id — used as lookup key (hashed in DB)
}

const accessSecret = (): string => {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) throw new Error("JWT_ACCESS_SECRET is not set");
  return s;
};

const refreshSecret = (): string => {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error("JWT_REFRESH_SECRET is not set");
  return s;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, accessSecret(), {
    expiresIn: (process.env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"]) ?? "15m",
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, refreshSecret(), {
    expiresIn: (process.env.REFRESH_TOKEN_TTL as jwt.SignOptions["expiresIn"]) ?? "7d",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, accessSecret()) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, refreshSecret()) as RefreshTokenPayload;
}

/** SHA-256 hash of a raw JWT string for safe DB storage. */
export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** Returns the Date when a refresh token expires based on env TTL. */
export function refreshTokenExpiresAt(): Date {
  const ttl = process.env.REFRESH_TOKEN_TTL ?? "7d";
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid REFRESH_TOKEN_TTL format: ${ttl}`);
  const [, amount, unit] = match;
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return new Date(Date.now() + parseInt(amount) * multipliers[unit]);
}
