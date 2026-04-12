import { create } from "zustand";
export * from "./authStore";
export * from "./connectionStore";
export * from "./pipelineStore";
export * from "./modelStore";
export * from "./observabilityStore";
export * from "./analyticsStore";
export * from "./monitoringStore";
export * from "./dashboardStore";
export * from "./contractStore";
export * from "./approvalStore";
export * from "./notificationStore";
export * from "./catalogStore";
export * from "./costStore";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
