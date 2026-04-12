"use client";

import React, { useState, useEffect } from "react";
import { Search, Clock, GitBranch, Table2, CheckCircle2, Play, Pause, XCircle, Shield, AlertTriangle, Database, Activity, Filter, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores";

const API = "http://localhost:8000/api/v1";

interface CatalogEntry {
  id: string;
  table_name: string;
  schema_name: string;
  layer: string;
  description: string;
  classification: string;
  tags: string[];
  quality_score: number;
  row_count: number;
  size_bytes: number;
  last_refreshed_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || "clear";
  const config: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    clear:     { color: "var(--c-green)", bg: "var(--c-green-bg)", icon: Shield },
    pii:       { color: "var(--c-amber)", bg: "var(--c-amber-bg)", icon: AlertTriangle },
    restricted:{ color: "var(--c-red)",   bg: "var(--c-red-bg)",   icon: XCircle },
  };
  const c = config[normalized] || config.clear;
  const Icon = c.icon;
  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Clear";
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase" style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
      <Icon size={12} strokeWidth={2.2} />
      {displayStatus}
    </span>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function CatalogPage() {
  const [assets, setAssets] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    async function fetchCatalog() {
      if (!token) return;
      try {
        const res = await fetch(`${API}/catalog`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAssets(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to fetch catalog:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, [token]);

  const layerConfig: Record<string, { color: string; bg: string }> = {
    bronze:  { color: "var(--c-amber)",  bg: "var(--c-amber-bg)" },
    silver:  { color: "var(--c-blue)",   bg: "var(--c-blue-bg)" },
    gold:    { color: "var(--c-purple)", bg: "var(--c-purple-bg)" },
  };

  return (
    <div className="page-content animate-in relative flex flex-col h-[calc(100vh-60px)]">
      <div className="page-header shrink-0">
        <div><h1 className="page-title">Data Catalog</h1><p className="page-subtitle">Govern, discover, and trace logical datasets across the Medallion architecture.</p></div>
        <div className="page-header-actions">
           <div className="table-search table-search--lg"><Search size={14} /><input placeholder="Search datasets, columns, tags…" className="bg-transparent border-none outline-none text-[13px] text-[var(--t1)]" /></div>
        </div>
      </div>

      <div className="section-card flex flex-col flex-1 min-h-0 border border-[var(--b2)] rounded-lg shadow-sm mb-4">
        <div className="section-card-header sticky top-0 bg-[var(--bg-card)] z-10 p-4 border-b border-[var(--b2)] flex justify-between items-center">
            <h2 className="section-card-title m-0">
               {loading ? "Loading assets..." : `Indexed Data Assets (${assets.length})`}
            </h2>
            <div className="table-header-right flex items-center gap-2">
               <button className="btn-icon-sm border border-[var(--b2)] rounded p-1.5 hover:bg-[var(--bg-muted)] transition-colors"><Filter size={13} /></button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full">
           {loading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-[var(--t3)]">
                 <Loader2 size={18} className="animate-spin" />
                 <span className="text-[13px]">Fetching catalog metadata...</span>
              </div>
           ) : assets.length === 0 ? (
              <div className="text-center py-12 text-[var(--t3)] text-[13px]">No assets indexed in the catalog yet. Run a pipeline to populate.</div>
           ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--b2)] bg-[var(--bg-muted)]">
                  <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Asset Identity</th>
                  <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Layer</th>
                  <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Governance</th>
                  <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider text-right">Size / Rows</th>
                  <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Last Refreshed</th>
                  <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-card)]">
                {assets.map((a) => {
                  const lc = layerConfig[a.layer?.toLowerCase()] || layerConfig.bronze;
                  return (
                    <tr key={a.id} className="border-b border-[var(--b1)] hover:bg-[var(--bg-muted)] transition-colors group">
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2 mb-1">
                              <Table2 size={15} className="text-[var(--c-blue)] shrink-0" />
                              <span className="font-semibold text-[13px] text-[var(--t1)] max-w-[220px] truncate" title={a.table_name}>{a.table_name}</span>
                           </div>
                           <span className="text-[11px] text-[var(--t3)] font-mono flex items-center gap-1.5"><Database size={11} className="shrink-0"/> <span className="truncate max-w-[220px]">s3://dataflow-lake/{a.layer?.toLowerCase() || "bronze"}</span></span>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                         <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider" style={{ color: lc.color, background: lc.bg }}>
                            {a.layer || "Bronze"}
                         </span>
                      </td>
                      <td className="px-5 py-4 align-middle"><StatusBadge status={a.classification || "Clear"} /></td>
                      <td className="px-5 py-4 align-middle text-right">
                         <div className="flex flex-col items-end">
                            <span className="text-[13px] font-medium text-[var(--t1)] font-mono">{formatBytes(a.size_bytes || 0)}</span>
                            <span className="text-[11px] text-[var(--t3)] font-mono">{(a.row_count || 0).toLocaleString()} rows</span>
                         </div>
                      </td>
                      <td className="px-5 py-4 align-middle"><span className="flex items-center gap-1.5 text-[12px] text-[var(--t3)]"><Clock size={13} /> {a.last_refreshed_at ? new Date(a.last_refreshed_at).toLocaleTimeString() : 'Never'}</span></td>
                      <td className="px-5 py-4 align-middle text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="btn-ghost-sm"><GitBranch size={13} className="mr-1.5"/> Lineage</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
           )}
        </div>
      </div>
    </div>
  );
}
