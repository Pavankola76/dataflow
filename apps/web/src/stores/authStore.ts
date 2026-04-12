import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false, 
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (email, pass) => {
        set({ isLoading: true, error: null });
        try {
          const data = (await api.login({ email, password: pass })) as any;
          const token = data.access_token;
          
          // Get user details
          const user = await api.me(token).catch(() => ({ name: "Admin", email }));
          
          set({ isAuthenticated: true, user, token, isLoading: false });
        } catch (e: any) {
          set({ isLoading: false, error: e.message || "Login failed" });
          throw e;
        }
      },
      register: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const resData = (await api.register(data)) as any;
          const token = resData.access_token;
          
          set({ isAuthenticated: true, user: { name: data.name, email: data.email }, token, isLoading: false });
        } catch (e: any) {
          set({ isLoading: false, error: e.message || "Registration failed" });
          throw e;
        }
      },
      logout: () => {
        set({ isAuthenticated: false, user: null, token: null });
        localStorage.removeItem("dataflow_auth");
      },
      clearError: () => {
        set({ error: null });
      }
    }),
    { name: "dataflow_auth" }
  )
);
