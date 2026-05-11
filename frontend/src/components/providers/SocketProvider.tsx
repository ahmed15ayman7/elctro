"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import type { Order } from "@/actions/orders.actions";
import { getSocketUrl, SOCKET_IO_PATH, registerBrowserSocket } from "@/lib/socket";
import { apiRequest } from "@/lib/api";

export type OrderUpdatedPayload = { order: Order };

type SocketContextValue = {
  subscribeOrderUpdated: (cb: (payload: OrderUpdatedPayload) => void) => () => void;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef(new Set<(p: OrderUpdatedPayload) => void>());

  const subscribeOrderUpdated = useCallback((cb: (payload: OrderUpdatedPayload) => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    let cancelled = false;
    const socketUrl = getSocketUrl();
    if (!socketUrl) return;

    (async () => {
      try {
        const res = await apiRequest<{ token?: string }>(  "/api/socket-handoff", { attachAuth: false });
        if (!res || cancelled) return;
        if (!res?.token || cancelled) return;

        const socket = io(socketUrl, {
          path: SOCKET_IO_PATH, auth: { token: res.token }, transports: ["websocket", "polling"], autoConnect: true,
        });

        socket.on("connect", () => {
          if (!cancelled) setConnected(true);
        });
        socket.on("disconnect", () => {
          if (!cancelled) setConnected(false);
        });
        socket.on("order:updated", (payload: OrderUpdatedPayload) => {
          listenersRef.current.forEach((fn) => {
            try {
              fn(payload);
            } catch {
              /* ignore subscriber errors */
            }
          });
        });
        socket.on("catalog:changed", () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("elctro:catalog-changed"));
          }
        });

        socketRef.current = socket;
        registerBrowserSocket(socket);
      } catch {
        setConnected(false);
      }
    })();

    return () => {
      cancelled = true;
      registerBrowserSocket(null);
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.id]);

  const value: SocketContextValue = {
    subscribeOrderUpdated,
    connected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useOrderRealtime(): SocketContextValue {
  const ctx = useContext(SocketContext);
  return (
    ctx ?? {
      subscribeOrderUpdated: () => () => undefined,
      connected: false,
    }
  );
}

export function useOrderRealtimeOptional(): SocketContextValue | null {
  return useContext(SocketContext);
}
