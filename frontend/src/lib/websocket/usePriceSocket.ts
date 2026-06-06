"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useMarketStore } from "@/lib/store/marketStore";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

interface PriceUpdatePayload {
  symbol: string;
  price: number;
  change: number;
}

export function usePriceSocket(symbols: string[] = ["BTC", "ETH", "SOL", "SUI"]) {
  const socketRef = useRef<Socket | null>(null);
  const updateLivePrice = useMarketStore((s) => s.updateLivePrice);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("[WS] Connected to price feed");
      socket.emit("subscribe", symbols);
    });

    socket.on("price_update", (data: PriceUpdatePayload) => {
      updateLivePrice(data.symbol, data.price, data.change);
    });

    socket.on("disconnect", (reason) => {
      console.log("[WS] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("[WS] Connection error:", err.message);
    });

    socketRef.current = socket;
  }, [symbols, updateLivePrice]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { socket: socketRef.current, connect, disconnect };
}
