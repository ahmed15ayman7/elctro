import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  googleSignIn,
  googleSignInWithAuthCode,
} from "../services/auth.service.js";
import {
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE,
} from "../lib/cookies.js";

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const googleSchema = z.object({
  idToken: z.string().min(1, "idToken is required"),
});

const googleCodeSchema = z.object({
  code: z.string().min(1, "code is required"),
  redirectUri: z.string().url("redirectUri must be a valid URL"),
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────

router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = registerSchema.parse(req.body);
      const result = await registerUser(input);
      setRefreshCookie(res, result.refreshToken);
      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = loginSchema.parse(req.body);
      const result = await loginUser(input);
      setRefreshCookie(res, result.refreshToken);
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/google ────────────────────────────────────────────────────

router.post(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = googleSchema.parse(req.body);
      const result = await googleSignIn(idToken);
      setRefreshCookie(res, result.refreshToken);
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/google/code (OAuth redirect flow) ─────────────────────────

router.post(
  "/google/code",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, redirectUri } = googleCodeSchema.parse(req.body);
      const result = await googleSignInWithAuthCode(code, redirectUri);
      setRefreshCookie(res, result.refreshToken);
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

router.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawToken: string | undefined = req.cookies[REFRESH_COOKIE];
      if (!rawToken) {
        res.status(401).json({ error: "No refresh token provided" });
        return;
      }
      const result = await refreshTokens(rawToken);
      setRefreshCookie(res, result.refreshToken);
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawToken: string | undefined = req.cookies[REFRESH_COOKIE];
      if (rawToken) {
        await logoutUser(rawToken);
      }
      clearRefreshCookie(res);
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
