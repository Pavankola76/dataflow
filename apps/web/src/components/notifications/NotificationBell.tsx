"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores";
import { Bell, Check, ExternalLink, X } from "lucide-react";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  notifications?: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

const mockNotifications: Notification[] = [
  { id: "n1", type: "pipeline_status", title: "Pipeline 'orders_ingestion' completed", message: "Processed 125,000 rows in 4.2s", is_read: false, created_at: "5 min ago" },
  { id: "n2", type: "alert", title: "Schema drift detected", message: "Column 'discount_pct' added to source", is_read: false, created_at: "12 min ago" },
  { id: "n3", type: "approval_request", title: "Approval needed: Deploy CLV model", link: "/approvals", is_read: false, created_at: "1 hour ago" },
  { id: "n4", type: "system", title: "Auto-heal succeeded", message: "Pipeline 'reviews' fixed automatically", is_read: true, created_at: "3 hours ago" },
];

const typeColors: Record<string, string> = {
  pipeline_status: "bg-emerald-400",
  alert: "bg-amber-400",
  approval_request: "bg-indigo-400",
  system: "bg-zinc-400",
  mention: "bg-blue-400",
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onMarkRead,
  onMarkAllRead,
}) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.is_read).length;
  const { token } = useAuthStore();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    await fetch(`http://localhost:8000/api/v1/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
    onMarkRead?.(id);
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    await fetch(`http://localhost:8000/api/v1/notifications/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
    onMarkAllRead?.();
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
      >
        <Bell className="w-[18px] h-[18px] text-zinc-400" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-zinc-900">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/40 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
            <span className="text-[14px] font-semibold text-zinc-200">Notifications</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-zinc-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors cursor-pointer ${
                    !n.is_read ? "bg-indigo-500/[0.03]" : ""
                  }`}
                  onClick={() => handleMarkRead(n.id)}
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${typeColors[n.type] || "bg-zinc-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-zinc-200 font-medium">{n.title}</div>
                    {n.message && <div className="text-[12px] text-zinc-500 mt-0.5 truncate">{n.message}</div>}
                    <div className="text-[10px] text-zinc-600 mt-1">{n.created_at}</div>
                  </div>
                  {n.link && <ExternalLink className="w-3 h-3 text-zinc-600 mt-1 shrink-0" />}
                  {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
