import { create } from "zustand";
import { api } from "@/lib/api";

interface Connection {
  id: string;
  name: string;
  connector_type: string;
  status: "active" | "error" | "pending";
  created_at: string;
}

interface ConnectionStore {
  connections: Connection[];
  loading: boolean;
  error: string | null;
  fetchConnections: () => Promise<void>;
  createConnection: (data: any) => Promise<Connection>;
  testConnection: (id: string) => Promise<boolean>;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connections: [],
  loading: false,
  error: null,

  fetchConnections: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = (await api.get("/api/v1/connections")) as any;
      set({ connections: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch connections", loading: false });
    }
  },

  createConnection: async (payload: any) => {
    set({ loading: true, error: null });
    try {
      const { data } = (await api.post("/api/v1/connections", payload)) as any;
      set((state) => ({ 
        connections: [data, ...state.connections],
        loading: false 
      }));
      return data;
    } catch (err: any) {
      set({ error: err.message || "Failed to create connection", loading: false });
      throw err;
    }
  },

  testConnection: async (id: string) => {
    try {
      const { data } = (await api.post(`/api/v1/connections/${id}/test`)) as any;
      return data.success;
    } catch (err) {
      return false;
    }
  }
}));
