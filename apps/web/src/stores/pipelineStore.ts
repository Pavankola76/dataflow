import { create } from "zustand";
import { api } from "@/lib/api";

interface Pipeline {
  id: string;
  name: string;
  connection_id: string;
  status: "idle" | "running" | "success" | "failed";
  schedule: string | null;
  created_at: string;
}

interface PipelineRun {
  id: string;
  pipeline_id: string;
  status: string;
  rows_processed: number;
}

interface PipelineStore {
  pipelines: Pipeline[];
  loading: boolean;
  error: string | null;
  fetchPipelines: () => Promise<void>;
  runPipeline: (id: string) => Promise<void>;
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  pipelines: [],
  loading: false,
  error: null,

  fetchPipelines: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = (await api.get("/api/v1/pipelines")) as any;
      set({ pipelines: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch pipelines", loading: false });
    }
  },

  runPipeline: async (id: string) => {
    try {
      await api.post(`/api/v1/pipelines/${id}/run`);
      // Optionally refresh pipelines after trigger
    } catch (err: any) {
      throw new Error(err.message || "Failed to run pipeline");
    }
  }
}));
