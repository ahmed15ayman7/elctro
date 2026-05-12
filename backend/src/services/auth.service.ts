import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
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
  imageUrl: string | null;
}

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  imageUrl: true,
} as const;

function toSafeUser(u: {
  id: string;
  email: string;
  name: string;
  role: unknown;
  imageUrl: string | null;
}): SafeUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: String(u.role),
    imageUrl: u.imageUrl ?? null,
  };
}

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerUser(
  input: RegisterInput
): Promise<{ user: SafeUser } & TokenPair> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name: input.name },
    select: safeUserSelect,
  });

  const tokens = await issueTokenPair(user.id, user.email, String(user.role));
  return { user: toSafeUser(user), ...tokens };
}

// ─── Login ───────────────────────────────────────────────────────────────────

export async function loginUser(
  input: LoginInput
): Promise<{ user: SafeUser } & TokenPair> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      imageUrl: true,
      passwordHash: true,
    },
  });

  if (user && !user.passwordHash) {
    throw new UnauthorizedError("This account uses Google sign-in");
  }

  // Constant-time failure to prevent user enumeration
  const passwordHash = user?.passwordHash ?? "$2b$12$invalidhashfortiming";
  const valid = await verifyPassword(input.password, passwordHash);

  if (!user || !valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const tokens = await issueTokenPair(user.id, user.email, String(user.role));
  return {
    user: toSafeUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl,
    }),
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
    select: safeUserSelect,
  });
  if (!user) throw new NotFoundError("User not found");

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair(user.id, user.email, String(user.role));
  return { user: toSafeUser(user), ...tokens };
}

// ─── Google sign-in ──────────────────────────────────────────────────────────

export async function googleSignIn(
  idToken: string
): Promise<{ user: SafeUser } & TokenPair> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new UnauthorizedError("Google sign-in is not configured");
  }

  const client = new OAuth2Client(clientId);
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
  } catch {
    throw new UnauthorizedError("Invalid Google token");
  }

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new UnauthorizedError("Invalid Google token");
  }

  if (payload.email_verified !== true) {
    throw new UnauthorizedError("Google email is not verified");
  }

  const sub = payload.sub;
  const email = payload.email.trim().toLowerCase();
  const name =
    (payload.name && payload.name.trim()) ||
    email.split("@")[0] ||
    "User";
  const picture = payload.picture ?? null;

  const existing =
    (await prisma.user.findUnique({ where: { googleId: sub } })) ??
    (await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    }));

  let user: {
    id: string;
    email: string;
    name: string;
    role: import("@prisma/client").Role;
    imageUrl: string | null;
  };

  if (existing) {
    if (existing.googleId && existing.googleId !== sub) {
      throw new ConflictError("This email is linked to another Google account");
    }

    if (!existing.googleId) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: sub,
          imageUrl: picture ?? existing.imageUrl,
          name: existing.name?.trim() ? existing.name : name,
        },
        select: safeUserSelect,
      });
    } else {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          imageUrl: picture ?? existing.imageUrl,
          name: name || existing.name,
        },
        select: safeUserSelect,
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleId: sub,
        imageUrl: picture,
        passwordHash: null,
      },
      select: safeUserSelect,
    });
  }

  const tokens = await issueTokenPair(user.id, user.email, String(user.role));
  return { user: toSafeUser(user), ...tokens };
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
