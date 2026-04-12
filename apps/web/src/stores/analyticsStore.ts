import { create } from "zustand";
import { api } from "../lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  chartType?: "bar" | "line" | "pie" | "table" | string;
  chartConfig?: any;
  results?: any[];
}

interface AnalyticsState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  submitQuery: (query: string) => Promise<void>;
  clearHistory: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  messages: [
    {
      id: "welcome-msg",
      role: "assistant",
      content: "Hello! I am your AI Data Analyst. Ask me any question about your data, e.g., 'What were the top 5 regions by revenue?'"
    }
  ],
  isLoading: false,
  error: null,

  submitQuery: async (query: string) => {
    // 1. Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };
    
    set({ 
      messages: [...get().messages, userMsg],
      isLoading: true,
      error: null
    });

    try {
      // 2. Fetch AI Analytics
      const data = (await api.post("/api/v1/analytics/query", { query })) as any;

      // 3. Add assistant response
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.explanation || "Here are your results.",
        sql: data.generated_sql,
        chartType: data.chart_type,
        chartConfig: data.chart_config,
        results: Array.isArray(data.results) ? data.results : undefined,
      };

      set({ 
        messages: [...get().messages, assistantMsg],
        isLoading: false 
      });

    } catch (err: any) {
      set({ 
        error: err.message || "Failed to process query. Please try again.",
        isLoading: false 
      });
    }
  },

  clearHistory: () => set({ 
    messages: [{
      id: "welcome-msg",
      role: "assistant",
      content: "Hello! I am your AI Data Analyst. Ask me any question about your data."
    }],
    error: null 
  }),
}));
