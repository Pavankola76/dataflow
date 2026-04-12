"use client";

import React, { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Eye, PenLine, BarChart3, Activity, Layers, ShieldCheck, TrendingUp, Zap, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores";

const API = "http://localhost:8000/api/v1";

interface DashboardItem {
  id: string;
  name: string;
  description: string;
  widget_count: number;
  updated_at: string;
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    async function fetchDashboards() {
      if (!token) return;
      try {
        const res = await fetch(`${API}/dashboards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboards(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboards", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboards();
  }, [token]);

  // Fallback preset colors and icons since they aren't saved in the DB schema
  const getStyleProps = (idx: number) => {
    const styles = [
      { color: "var(--c-blue)", icon: BarChart3 },
      { color: "var(--c-green)", icon: Activity },
      { color: "var(--c-purple)", icon: Layers },
      { color: "var(--c-amber)", icon: ShieldCheck },
      { color: "var(--c-red)", icon: TrendingUp },
      { color: "var(--c-teal)", icon: Zap },
    ];
    return styles[idx % styles.length];
  };

  return (
    <div className="page-content animate-in h-[calc(100vh-60px)] flex flex-col">
      <div className="page-header shrink-0">
        <div><h1 className="page-title">Dashboards</h1><p className="page-subtitle">Build interactive dashboards from your analytics queries.</p></div>
        <button className="btn-primary-console"><Plus size={14} />New Dashboard</button>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        {loading ? (
           <div className="flex items-center justify-center py-20 gap-3 text-[var(--t3)]">
             <Loader2 size={18} className="animate-spin" />
             <span className="text-[13px]">Fetching dashboards...</span>
           </div>
        ) : dashboards.length === 0 ? (
           <div className="text-center py-20 border border-dashed border-[var(--b2)] rounded-xl m-1">
             <BarChart3 size={32} className="mx-auto text-[var(--t4)] mb-3" />
             <h3 className="text-[15px] text-[var(--t1)] font-semibold">No dashboards built yet.</h3>
             <p className="text-[var(--t3)] text-[13px] mt-1 mb-4">Save queries from the AI Engine to spawn dashboard widgets.</p>
             <button className="btn-primary-sm mx-auto"><Plus size={14}/> Create Blank</button>
           </div>
        ) : (
          <div className="dashboard-grid pb-12">
            {dashboards.map((d, index) => {
              const style = getStyleProps(index);
              const Icon = style.icon;
              return (
                <div key={d.id} className="dashboard-card group">
                  <div className="dashboard-card-header">
                    <div className="dashboard-card-icon" style={{ background: `${style.color}15`, color: style.color }}>
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <button className="btn-icon-sm dashboard-more"><MoreHorizontal size={14} /></button>
                  </div>
                  {/* Mini chart mockup */}
                  <div className="dashboard-chart">
                    <svg viewBox="0 0 200 50" className="dashboard-chart-svg">
                      <defs>
                        <linearGradient id={`grad-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={style.color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={style.color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={`M0 40 Q30 ${25 + Math.random() * 15} 60 ${20 + Math.random() * 15} T120 ${15 + Math.random() * 10} T200 ${10 + Math.random() * 20}`} fill="none" stroke={style.color} strokeWidth="2" strokeLinecap="round" />
                      <path d={`M0 40 Q30 ${25 + Math.random() * 15} 60 ${20 + Math.random() * 15} T120 ${15 + Math.random() * 10} T200 ${10 + Math.random() * 20} V50 H0 Z`} fill={`url(#grad-${d.id})`} />
                    </svg>
                  </div>
                  <h3 className="dashboard-card-name truncate">{d.name}</h3>
                  <div className="dashboard-card-meta">
                    <span>{d.widget_count} widgets</span>
                    <span className="meta-dot" />
                    <span>{d.updated_at ? new Date(d.updated_at).toLocaleDateString() : 'Just now'}</span>
                  </div>
                  <div className="dashboard-card-actions opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-ghost-sm w-full justify-center bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] border border-[var(--b2)]"><Eye size={12} className="mr-1.5"/> View Report</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
