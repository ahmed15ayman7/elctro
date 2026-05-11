import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshTokenExpiresAt,
} from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../lib/errors.js";

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerUser(
  input: RegisterInput
): Promise<{ user: SafeUser } & TokenPair> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name },
    select: { id: true, email: true, name: true, role: true },
  });

  const tokens = await issueTokenPair(user.id, user.email, user.role);
  return { user: { ...user, role: user.role.toString() }, ...tokens };
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginUser(
  input: LoginInput
): Promise<{ user: SafeUser } & TokenPair> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Constant-time failure to prevent user enumeration
  const passwordHash = user?.passwordHash ?? "$2b$12$invalidhashfortiming";
  const valid = await verifyPassword(input.password, passwordHash);

  if (!user || !valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const tokens = await issueTokenPair(user.id, user.email, user.role);
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    ...tokens,
  };
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refreshTokens(
  rawRefreshToken: string
): Promise<{ user: SafeUser } & TokenPair> {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    // Possible token reuse — revoke all sessions for this user
    if (stored) {
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId },
        data: { revokedAt: new Date() },
      });
    }
    throw new UnauthorizedError("Refresh token is invalid or has been revoked");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) throw new NotFoundError("User not found");

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair(user.id, user.email, user.role);
  return { user: { ...user, role: user.role.toString() }, ...tokens };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutUser(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function issueTokenPair(
  userId: string,
  email: string,
  role: string
): Promise<TokenPair> {
  const jti = uuidv4();
  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = signRefreshToken({ sub: userId, jti });

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  return { accessToken, refreshToken };
}
