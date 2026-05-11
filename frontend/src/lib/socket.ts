/**
 * Realtime transport: Socket.io is created in `SocketProvider` after
 * `GET /api/socket-handoff` returns the JWT for `auth.token`.
 * Use `useOrderRealtime()` from `@/components/providers/SocketProvider` to subscribe.
 */
import type { Socket } from "socket.io-client";

export const SOCKET_IO_PATH = "/socket.io" as const;

let browserSocket: Socket | null = null;

/** @internal Used by SocketProvider only. */
export function registerBrowserSocket(socket: Socket | null): void {
  browserSocket = socket;
}

/** Same-origin Socket.io client instance when connected; otherwise null. */
export function getSocket(): Socket | null {
  return browserSocket;
}

export function getSocketUrl(): string {
  if (typeof window === "undefined") return "";
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
}
