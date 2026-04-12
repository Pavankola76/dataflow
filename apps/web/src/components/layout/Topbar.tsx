"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import { Search, Database } from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";

export const Topbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link href="/" className="topbar-brand" style={{ outline: 'none', textDecoration: 'none' }}>
          <div className="topbar-logo"><Database size={15} strokeWidth={2.5} /></div>
          <span className="topbar-wordmark">DataFlow <span className="topbar-ai">AI</span></span>
        </Link>
      </div>
      <div className="topbar-center hidden sm:block">
        <div className="topbar-search">
          <Search size={15} className="topbar-search-icon" />
          <input type="text" placeholder="Search services, data catalogs, and models…" className="topbar-search-input" />
          <kbd className="topbar-search-kbd">⌘K</kbd>
        </div>
      </div>
      <div className="topbar-right">
        <NotificationBell />
        <div className="topbar-divider" />
        <div className="topbar-user">
          <div className="topbar-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
          <div className="topbar-user-info hidden sm:flex">
            <span className="topbar-user-name">{user?.name || "Admin"}</span>
            <span className="topbar-user-role">Data Engineer</span>
          </div>
        </div>
      </div>
    </header>
  );
};
