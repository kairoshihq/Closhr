import { create } from "zustand";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface PriceAlert {
  id: string;
  coinId: string;
  condition: "above" | "below";
  threshold: number;
  active: boolean;
  createdAt: string;
}

interface AlertState {
  alerts: PriceAlert[];
  loading: boolean;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  createAlert: (coinId: string, condition: "above" | "below", threshold: number) => Promise<void>;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/alerts`, { credentials: "include" });
      if (!res.ok) throw new Error(`Alerts API error: ${res.status}`);
      const data: PriceAlert[] = await res.json();
      set({ alerts: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch alerts",
        loading: false,
      });
    }
  },

  createAlert: async (coinId, condition, threshold) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ coinId, condition, threshold }),
      });
      if (!res.ok) throw new Error(`Failed to create alert: ${res.status}`);
      // Re-fetch alerts
      const alerts = await fetch(`${API_URL}/alerts`, { credentials: "include" });
      if (alerts.ok) {
        const data: PriceAlert[] = await alerts.json();
        set({ alerts: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create alert",
        loading: false,
      });
    }
  },
}));
