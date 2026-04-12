import { create } from "zustand";

interface Contract {
  id: string;
  table_name: string;
  contract_version: number;
  status: string;
  enforcement_mode: string;
  violation_count: number;
}

interface ContractState {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  fetchContracts: () => Promise<void>;
  createContract: (data: { table_name: string; schema_contract: object; enforcement_mode?: string }) => Promise<void>;
  generateContract: (tableName: string) => Promise<void>;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [],
  loading: false,
  error: null,

  fetchContracts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API}/api/v1/contracts`);
      if (!res.ok) throw new Error("Failed to fetch contracts");
      set({ contracts: await res.json(), loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  createContract: async (data) => {
    try {
      await fetch(`${API}/api/v1/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await get().fetchContracts();
    } catch {}
  },

  generateContract: async (tableName) => {
    try {
      await fetch(`${API}/api/v1/contracts/generate?table_name=${tableName}`, { method: "POST" });
      await get().fetchContracts();
    } catch {}
  },
}));
