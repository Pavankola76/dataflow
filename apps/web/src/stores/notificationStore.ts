import { create } from "zustand";

interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await fetch(`${API}/api/v1/notifications`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Notification[] = await res.json();
      set({ notifications: data, unreadCount: data.filter(n => !n.is_read).length, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    try {
      await fetch(`${API}/api/v1/notifications/${id}/read`, { method: "POST" });
      const updated = get().notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
      set({ notifications: updated, unreadCount: updated.filter(n => !n.is_read).length });
    } catch {}
  },

  markAllRead: async () => {
    try {
      await fetch(`${API}/api/v1/notifications/read-all`, { method: "POST" });
      set({ notifications: get().notifications.map(n => ({ ...n, is_read: true })), unreadCount: 0 });
    } catch {}
  },
}));
