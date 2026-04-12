import { create } from "zustand";
import { api } from "../lib/api";

export interface Alert {
  id: string;
  pipeline_id: string;
  pipeline_name: string;
  timestamp: string;
  raw_error_message: string;
  status: "unresolved" | "mitigating" | "resolved";
  ai_report?: {
    error_type: string;
    root_cause: string;
    confidence: number;
    affected_models: string[];
    suggested_action: string;
    severity: string;
  };
  auto_heal_diff?: {
    fix_action: string;
    fix_diff: string;
    auto_executed: boolean;
    rollback_available: boolean;
    reasoning: string;
    status: string;
  };
}

interface MonitoringState {
  alerts: Alert[];
  isLoading: boolean;
  isFixing: string | null;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  triggerAutoFix: (alertId: string) => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  alerts: [],
  isLoading: false,
  isFixing: null,
  error: null,

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await api.get("/api/v1/monitoring/alerts");
      set({ alerts: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  triggerAutoFix: async (alertId: string) => {
    set({ isFixing: alertId, error: null });
    try {
      await api.post(`/api/v1/monitoring/alerts/${alertId}/auto-fix`);
      
      // Update local state to immediately show as resolved
      const currentAlerts = get().alerts;
      const updatedAlerts = currentAlerts.map(alert => 
        alert.id === alertId ? { ...alert, status: "resolved" as const } : alert
      );
      set({ alerts: updatedAlerts, isFixing: null });
      
    } catch (err: any) {
      set({ error: err.message, isFixing: null });
    }
  }
}));
