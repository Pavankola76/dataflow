import { create } from "zustand";
import { api } from "@/lib/api";

export interface PipelineHealth {
  status: string;
  rows_processed_24h: string;
  active_pipelines: number;
  failing_contracts: number;
  avg_latency_ms: number;
  incidents: string[];
}

export interface Contract {
  table_name: string;
  owner?: string;
  description?: string;
  columns: any[];
}

export interface LineageGraph {
  nodes: any[];
  edges: any[];
}

interface ObservabilityStore {
  health: PipelineHealth | null;
  contracts: Contract[];
  lineage: LineageGraph | null;
  loading: boolean;
  error: string | null;
  fetchHealth: () => Promise<void>;
  fetchContracts: () => Promise<void>;
  fetchLineage: (tableId: string) => Promise<void>;
}

export const useObservabilityStore = create<ObservabilityStore>((set) => ({
  health: null,
  contracts: [],
  lineage: null,
  loading: false,
  error: null,

  fetchHealth: async () => {
    set({ loading: true, error: null });
    try {
      const data: any = await api.get("/api/v1/observability/health");
      set({ health: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch health", loading: false });
    }
  },

  fetchContracts: async () => {
    set({ loading: true, error: null });
    try {
      const data: any = await api.get("/api/v1/observability/contracts");
      set({ contracts: data.contracts || [], loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch contracts", loading: false });
    }
  },

  fetchLineage: async (tableId: string) => {
    set({ loading: true, error: null, lineage: null });
    try {
      const data: any = await api.get(`/api/v1/observability/lineage/${tableId}`);
      set({ lineage: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch lineage", loading: false });
    }
  }
}));
