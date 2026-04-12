import { create } from "zustand";

interface CostBreakdown {
  [costType: string]: { total: number; count: number };
}

interface CostState {
  breakdown: CostBreakdown;
  totalCost: number;
  loading: boolean;
  fetchCosts: () => Promise<void>;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useCostStore = create<CostState>((set) => ({
  breakdown: {},
  totalCost: 0,
  loading: false,

  fetchCosts: async () => {
    // Cost endpoint not yet exposed as a router — placeholder
    set({ loading: true });
    try {
      // Future: const res = await fetch(`${API}/api/v1/costs/summary`);
      set({
        breakdown: {
          compute: { total: 245.50, count: 150 },
          storage: { total: 32.10, count: 30 },
          query: { total: 18.75, count: 500 },
          api_call: { total: 5.20, count: 1200 },
        },
        totalCost: 301.55,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },
}));
