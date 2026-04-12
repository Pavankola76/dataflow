"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores";
import { 
  Home, Link2, GitBranch, BookOpen, BarChart3, FileCheck, ShieldCheck, ChevronLeft, ChevronRight, Sparkles, Layers, ArrowRightLeft, CircleDollarSign, GitCommit, HardDriveDownload, ShieldAlert, Activity, FolderClock, BookMarked, Building2, Brain, Code2, Users, Gauge, Shield, MonitorDot, Settings
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", href: "/home", label: "Overview", icon: Home },
  { id: "connections", href: "/connections", label: "Connections", icon: Link2 },
  { id: "ingestion", href: "/ingestion", label: "Data Ingestion", icon: HardDriveDownload },
  { id: "pipelines", href: "/pipelines", label: "Pipelines", icon: GitBranch },
  { id: "streams", href: "/streams", label: "Streaming DAG", icon: Activity },
  { id: "models", href: "/models", label: "Data Models", icon: Layers },
  { id: "quality", href: "/quality", label: "Data Quality", icon: ShieldAlert },
  { id: "memory", href: "/memory", label: "AI Memory", icon: Brain },
  { id: "catalog", href: "/catalog", label: "Data Catalog", icon: BookOpen },
  { id: "glossary", href: "/glossary", label: "Business Glossary", icon: BookMarked },
  { id: "lineage", href: "/lineage", label: "Lineage", icon: GitBranch },
  { id: "dashboards", href: "/dashboards", label: "Dashboards", icon: BarChart3 },
  { id: "collaborate", href: "/collaborate", label: "Multiplayer IDE", icon: Users },
  { id: "sdk", href: "/sdk", label: "Embed SDK", icon: Code2 },
  { id: "reports", href: "/reports", label: "Scheduled Reports", icon: FolderClock },
  { id: "analytics", href: "/analytics", label: "Analytics", icon: Sparkles },
  { id: "performance", href: "/performance", label: "Performance & Load", icon: Gauge },
  { id: "contracts", href: "/contracts", label: "Contracts", icon: FileCheck },
  { id: "approvals", href: "/approvals", label: "Approvals", icon: ShieldCheck },
  { id: "monitoring", href: "/monitoring", label: "Monitoring", icon: MonitorDot },
  { id: "commits", href: "/commits", label: "Version Control", icon: GitCommit },
  { id: "syncs", href: "/syncs", label: "Reverse ETL", icon: ArrowRightLeft },
  { id: "cost", href: "/cost", label: "Cost & Usage", icon: CircleDollarSign },
  { id: "security", href: "/security", label: "Security Audit", icon: Shield },
  { id: "workspaces", href: "/workspaces", label: "Workspaces", icon: Building2 },
  { id: "divider", href: "", label: "", icon: null },
  { id: "settings", href: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <nav className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}>
      <div className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          if (item.id === "divider") {
            return <div key={item.id} className="my-2 border-t border-[var(--b2)]" />;
          }

          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`sidebar-item ${isActive ? "sidebar-item--active" : ""}`}
              title={item.label}
            >
              {item.icon && <item.icon size={17} strokeWidth={1.8} />}
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
      <button
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </nav>
  );
};
