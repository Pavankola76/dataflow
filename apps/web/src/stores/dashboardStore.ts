import { create } from "zustand";

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widget_count: number;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DashboardState {
  dashboards: Dashboard[];
  loading: boolean;
  error: string | null;
  fetchDashboards: () => Promise<void>;
  createDashboard: (name: string, description?: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: [],
  loading: false,
  error: null,

  fetchDashboards: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/dashboards`);
      if (!res.ok) throw new Error("Failed to fetch dashboards");
      const data = await res.json();
      set({ dashboards: data, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  createDashboard: async (name, description) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/dashboards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) await get().fetchDashboards();
    } catch {}
  },

  deleteDashboard: async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/dashboards/${id}`, { method: "DELETE" });
      set({ dashboards: get().dashboards.filter(d => d.id !== id) });
    } catch {}
  },
}));
