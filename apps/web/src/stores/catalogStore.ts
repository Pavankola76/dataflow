import { create } from "zustand";

interface CatalogEntry {
  id: string;
  table_name: string;
  schema_name?: string;
  layer: string;
  description?: string;
  classification?: string;
  tags?: string[];
  quality_score?: number;
  row_count?: number;
  size_bytes?: number;
  last_refreshed_at?: string;
}

interface Lineage {
  table: string;
  upstream: { source_table: string; source_column?: string; target_column?: string; transformation_type?: string }[];
  downstream: { target_table: string; source_column?: string; target_column?: string; transformation_type?: string }[];
}

interface CatalogState {
  entries: CatalogEntry[];
  lineage: Lineage | null;
  loading: boolean;
  error: string | null;
  fetchCatalog: (layer?: string, search?: string) => Promise<void>;
  fetchLineage: (tableName: string) => Promise<void>;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useCatalogStore = create<CatalogState>((set) => ({
  entries: [],
  lineage: null,
  loading: false,
  error: null,

  fetchCatalog: async (layer, search) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (layer) params.set("layer", layer);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/api/v1/catalog?${params}`);
      if (!res.ok) throw new Error("Failed to fetch catalog");
      set({ entries: await res.json(), loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchLineage: async (tableName) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/v1/lineage/${tableName}`);
      if (!res.ok) throw new Error("Failed to fetch lineage");
      set({ lineage: await res.json(), loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
