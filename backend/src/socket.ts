import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { verifyAccessToken } from "./lib/jwt.js";

let ioInstance: Server | null = null;

function socketCorsOrigins(): string[] {
  const primary = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
  const extras = (process.env.SOCKET_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const hardcoded = "https://api.ahmed15ayman7.com";
  return Array.from(new Set([primary, ...extras, hardcoded]));
}

function redisUrlForLog(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = "****";
    return u.toString();
  } catch {
    return "redis://(configured)";
  }
}

/**
 * Attach Socket.io to the HTTP server. Authenticates via `handshake.auth.token` (access JWT).
 * Rooms: `user:{userId}` for all authenticated users; `admin` for ADMIN role.
 *
 * When `REDIS_URL` is set, uses the official Redis adapter so broadcasts work across multiple
 * Node processes / replicas (Docker Compose or Kubernetes).
 */
export async function initSocket(httpServer: HttpServer): Promise<Server> {
  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: socketCorsOrigins(),
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token || typeof token !== "string") {
      next(new Error("Unauthorized: missing token"));
      return;
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    const role = socket.data.role as string;
    socket.join(`user:${userId}`);
    if (role === "ADMIN") {
      socket.join("admin");
    }
    socket.on("order:subscribe", (orderId: string) => {
      if (typeof orderId === "string" && orderId.length > 0) {
        socket.join(`order:${orderId}`);
      }
    });
    socket.on("order:unsubscribe", (orderId: string) => {
      if (typeof orderId === "string") {
        socket.leave(`order:${orderId}`);
      }
    });
  });

  const redisUrl = process.env.REDIS_URL?.trim();
  if (redisUrl) {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log(`[socket] Redis adapter enabled (${redisUrlForLog(redisUrl)})`);
  } else {
    console.log("[socket] Redis adapter disabled (set REDIS_URL to enable multi-instance fan-out)");
  }

  ioInstance = io;
  return io;
}

export function getIO(): Server | null {
  return ioInstance;
}

/** Broadcast order payload to admin room, owning user room, and optional order room. */
export function emitOrderUpdated(order: Record<string, unknown>): void {
  const io = ioInstance;
  if (!io) return;
  const userId = order.userId;
  if (typeof userId !== "string") return;
  const payload = { order };
  io.to("admin").emit("order:updated", payload);
  io.to(`user:${userId}`).emit("order:updated", payload);
  const id = order.id;
  if (typeof id === "string") {
    io.to(`order:${id}`).emit("order:updated", payload);
  }
}

export function emitCatalogChanged(): void {
  const io = ioInstance;
  if (!io) return;
  io.emit("catalog:changed", { at: new Date().toISOString() });
}
