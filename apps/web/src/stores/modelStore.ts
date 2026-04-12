import { create } from "zustand";
import { api } from "@/lib/api";

export interface ColumnDef {
  name: string;
  type: string;
  is_pk?: boolean;
  is_fk?: boolean;
  references?: string;
}

export interface TableDef {
  name: string;
  description?: string;
  columns: ColumnDef[];
  source_tables: string[];
  scd_type?: number;
}

export interface VisualModel {
  facts: TableDef[];
  dimensions: TableDef[];
  reasoning?: string;
}

interface ModelStore {
  visualModel: VisualModel | null;
  loading: boolean;
  error: string | null;
  dbtCode: Record<string, string> | null;
  isGeneratingCode: boolean;
  models: any[];
  isLoading: boolean;
  fetchModels: () => Promise<void>;
  suggestModel: (schemaContext: any[]) => Promise<void>;
  generateDbtCode: () => Promise<void>;
}

export const useModelStore = create<ModelStore>((set, get) => ({
  visualModel: null,
  loading: false,
  error: null,
  dbtCode: null,
  isGeneratingCode: false,
  models: [
    { id: '1', table_name: 'fct_subscriptions', schema_name: 'core', materialization: 'table', contains_pii: false },
    { id: '2', table_name: 'dim_customers', schema_name: 'core', materialization: 'view', contains_pii: true },
    { id: '3', table_name: 'stg_stripe_charges', schema_name: 'staging', materialization: 'ephemeral', contains_pii: false },
  ],
  isLoading: false,

  fetchModels: async () => {
    // Mock fetch for the UI
    set({ isLoading: true });
    setTimeout(() => set({ isLoading: false }), 500);
  },

  suggestModel: async (schemaContext) => {
    set({ loading: true, error: null });
    try {
      const { data } = (await api.post("/api/v1/models/suggest", { schema_context: schemaContext })) as any;
      set({ visualModel: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to suggest model", loading: false });
    }
  },

  generateDbtCode: async () => {
    const { visualModel } = get();
    if (!visualModel) return;

    set({ isGeneratingCode: true, error: null });
    try {
      const { data } = (await api.post("/api/v1/models/generate-dbt", { visual_model: visualModel })) as any;
      set({ dbtCode: data.dbt_files || {}, isGeneratingCode: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to generate dbt code", isGeneratingCode: false });
    }
  }
}));
