"use client";

import React, { useState, useEffect } from "react";
import { HardDriveDownload, RefreshCw, Database, Server, CheckCircle2, PlayCircle, Clock, Activity, Loader2, ArrowRight, Table, ServerCrash } from "lucide-react";
import { useAuthStore } from "@/stores";

interface SyncTask {
  id: string;
  source: string;
  destination: string;
  table_name: string;
  status: string;
  rows_processed: number;
  bytes_transferred: number;
  started_at: string;
  duration_sec: number;
}

export default function IngestionPage() {
  const [syncs, setSyncs] = useState<SyncTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const fetchSyncs = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/ingestion/syncs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSyncs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch ingestion syncs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncs();
    const interval = setInterval(fetchSyncs, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  const runningSyncs = syncs.filter(s => s.status === 'Running').length;
  const totalBytes = syncs.reduce((acc, s) => acc + s.bytes_transferred, 0);

  return (
    <div className="page-content animate-in h-screen overflow-y-auto">
      <div className="page-header shrink-0 mb-8">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <HardDriveDownload size={20} className="text-[var(--c-indigo)]" />
            Data Lakehouse Ingestion
          </h1>
          <p className="page-subtitle">Monitor physical data extraction from RDBMS sources into Bronze-layer Iceberg tables on MinIO.</p>
        </div>
        <div className="page-header-actions">
           <button onClick={fetchSyncs} className="bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2">
             <RefreshCw size={14} className={runningSyncs > 0 ? "animate-spin" : ""} />
             Refresh Queue
           </button>
           <button className="bg-[var(--c-indigo)] hover:bg-indigo-500 text-white border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
             <PlayCircle size={14} />
             New Sync Job
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[var(--c-indigo-bg)] to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
              <Activity size={15} /> Active Syncs
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">{runningSyncs}</div>
            <div className="text-[12px] text-[var(--t3)]">extracting shards</div>
         </div>
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
              <Database size={15} /> Intake Volume
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">{formatBytes(totalBytes)}</div>
            <div className="text-[12px] text-[var(--t3)]">across {syncs.length} successful tasks</div>
         </div>
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2 bg-[#0d1117] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--c-blue)] to-[var(--c-purple)]"></div>
            <div className="flex items-center gap-2 text-[var(--c-purple)] text-[13px] font-medium uppercase tracking-wider">
              <Server size={15} /> Target Cluster
            </div>
            <div className="flex items-center gap-2 text-2xl font-mono text-white tracking-tight mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--c-green)] animate-pulse shadow-[0_0_10px_rgba(40,167,69,0.8)]"></span>
              s3://bronze-zone
            </div>
         </div>
      </div>

      <div className="section-card flex flex-col flex-1 min-h-0 border border-[var(--b2)] rounded-lg shadow-sm">
        <div className="section-card-header sticky top-0 bg-[var(--bg-card)] z-10 p-4 border-b border-[var(--b2)] flex justify-between items-center">
            <h2 className="section-card-title m-0 flex items-center gap-2 text-[14px]">
              <Clock size={16} className="text-[var(--t3)]"/> Live Sync Queue
            </h2>
        </div>
        <div className="flex-1 overflow-y-auto w-full">
            <div className="flex flex-col">
              {syncs.map(sync => (
                <div key={sync.id} className="group flex flex-col border-b border-[var(--b1)] bg-[#0d1117]/30 hover:bg-[var(--bg-muted)] transition-colors">
                   <div className="grid grid-cols-12 gap-4 items-center p-4 px-5">
                      
                      {/* Status Column */}
                      <div className="col-span-3 flex items-center gap-4">
                         <div className={`w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center shadow-inner relative overflow-hidden ${sync.status === 'Running' ? 'bg-[var(--c-blue-bg)] text-[var(--c-blue)]' : 'bg-[var(--c-green-bg)] text-[var(--c-green)] text-[var(--t1)]'}`}>
                            {sync.status === 'Running' ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            {sync.status === 'Running' && (
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--c-blue)]/10 animate-pulse"></div>
                            )}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-white tracking-tight">{sync.status}</span>
                           <span className="text-[11px] text-[var(--t3)] font-mono">{sync.id}</span>
                         </div>
                      </div>

                      {/* Topology Mapping Column */}
                      <div className="col-span-4 flex items-center gap-4 text-[13px] font-medium">
                         <div className="flex items-center gap-2 bg-[#141820] border border-[var(--b2)] px-3 py-1.5 rounded-md min-w-[120px]">
                           <Database size={14} className="text-[var(--c-amber)]" />
                           <span className="truncate text-white">{sync.source}</span>
                         </div>
                         
                         <ArrowRight size={16} className="text-[var(--t3)] shrink-0" />
                         
                         <div className="flex items-center gap-2 bg-[#141820] border border-[var(--b2)] px-3 py-1.5 rounded-md min-w-[120px]">
                           <Server size={14} className="text-[var(--c-indigo)]" />
                           <span className="truncate text-white">{sync.destination}</span>
                         </div>
                      </div>

                      {/* Object Extracted */}
                      <div className="col-span-2">
                         <div className="flex items-center gap-2 bg-[#101317] border border-[var(--b1)] px-3 py-1.5 rounded-md w-max">
                           <Table size={13} className="text-[var(--c-purple)]" />
                           <span className="text-[12px] font-mono text-white tracking-tight">{sync.table_name}</span>
                         </div>
                      </div>

                      {/* Telemetry Stats */}
                      <div className="col-span-3 flex flex-col items-end text-right justify-center">
                         <div className="text-[13px] font-mono font-bold text-white tracking-tight flex items-baseline gap-1">
                            {formatBytes(sync.bytes_transferred)}
                            <span className="text-[10px] text-[var(--t3)] font-sans uppercase tracking-wider font-semibold">synced</span>
                         </div>
                         <div className="w-full bg-[#181d26] rounded-full h-1.5 overflow-hidden my-2 shadow-inner">
                            <div 
                               className={`h-full rounded-full transition-all duration-1000 ${sync.status === 'Running' ? 'bg-gradient-to-r from-[var(--c-blue)] to-[var(--c-purple)]' : 'bg-[var(--c-green)]'}`}
                               style={{ width: sync.status === 'Running' ? '65%' : '100%' }}
                            ></div>
                         </div>
                         <div className="flex justify-between w-full text-[11px] font-mono text-[var(--t2)]">
                            <span className="font-semibold text-white">{(sync.rows_processed).toLocaleString()} rows</span>
                            <span>{sync.duration_sec}s</span>
                         </div>
                      </div>

                   </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
