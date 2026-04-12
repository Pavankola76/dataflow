import { create } from "zustand";

interface ApprovalRequest {
  id: string;
  request_type: string;
  resource_type: string;
  resource_id: string;
  requested_by: string;
  change_description?: string;
  status: string;
  created_at?: string;
}

interface ApprovalState {
  approvals: ApprovalRequest[];
  loading: boolean;
  error: string | null;
  fetchApprovals: (status?: string) => Promise<void>;
  approve: (id: string, comment?: string) => Promise<void>;
  reject: (id: string, comment?: string) => Promise<void>;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useApprovalStore = create<ApprovalState>((set, get) => ({
  approvals: [],
  loading: false,
  error: null,

  fetchApprovals: async (status = "pending") => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/v1/approvals?status=${status}`);
      if (!res.ok) throw new Error("Failed to fetch approvals");
      set({ approvals: await res.json(), loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  approve: async (id, comment) => {
    try {
      await fetch(`${API}/api/v1/approvals/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      set({ approvals: get().approvals.map(a => a.id === id ? { ...a, status: "approved" } : a) });
    } catch {}
  },

  reject: async (id, comment) => {
    try {
      await fetch(`${API}/api/v1/approvals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      set({ approvals: get().approvals.map(a => a.id === id ? { ...a, status: "rejected" } : a) });
    } catch {}
  },
}));
