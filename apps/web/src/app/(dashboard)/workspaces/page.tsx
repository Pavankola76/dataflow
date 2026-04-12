"use client";

import React, { useState, useEffect } from "react";
import { Building2, Plus, Clock, Database, Users, Settings, Activity, Server, Target, Zap, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores";

interface WorkspaceEnv {
  id: string;
  name: string;
  role: string;
  region: string;
  members: number;
  storage_gb: number;
  compute_hours: number;
  status: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceEnv[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/workspaces/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setWorkspaces(data);
        } else {
          setWorkspaces([]);
        }
      } catch (err) {
        console.error("Failed to fetch workspaces", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page-content animate-in h-screen overflow-y-auto">
      <div className="page-header shrink-0 mb-8 border-b border-[var(--b2)] pb-4 block">
        <div className="flex justify-between items-center w-full mb-4">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Building2 size={20} className="text-[var(--c-indigo)]" />
                Enterprise Workspaces
              </h1>
              <p className="page-subtitle">Partition DataFlow AI into strictly isolated organization environments and cloud networks.</p>
            </div>
            <div className="page-header-actions">
               <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
                 <Settings size={14} className="text-[var(--t3)]" /> Global Billing
               </button>
               <button className="bg-[var(--c-indigo)] hover:bg-indigo-500 text-white border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
                 <Plus size={14} /> Provision Workspace
               </button>
            </div>
        </div>

        <div className="flex items-center gap-8 px-4 py-3 bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg">
           <div className="flex items-center gap-3">
              <Server size={16} className="text-[var(--t3)]" />
              <div>
                 <div className="text-[10px] text-[var(--t3)] uppercase font-semibold">Active Compute Nodes</div>
                 <div className="text-[14px] font-mono text-[var(--t1)] font-semibold">14,204 <span className="font-sans text-[11px] font-normal text-[var(--c-green)]">+12%</span></div>
              </div>
           </div>
           <div className="w-px h-8 bg-[var(--b2)]"></div>
           <div className="flex items-center gap-3">
              <Database size={16} className="text-[var(--t3)]" />
              <div>
                 <div className="text-[10px] text-[var(--t3)] uppercase font-semibold">Total Iceberg Storage</div>
                 <div className="text-[14px] font-mono text-[var(--t1)] font-semibold">21.8 <span className="font-sans text-[11px] font-normal text-[var(--t3)]">TB</span></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {workspaces.map((ws) => (
          <div key={ws.id} className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl shadow-sm hover:border-[var(--c-indigo)]/50 transition-colors flex flex-col overflow-hidden relative group">
             
             {ws.id === 'ws_acme_prod' && (
                <div className="absolute top-0 right-0 py-1 px-3 bg-[var(--c-indigo-bg)] border-b border-l border-[var(--c-indigo)]/30 rounded-bl-lg text-[10px] font-bold text-[var(--c-indigo)] uppercase tracking-wider flex items-center gap-1.5 z-10">
                  <Activity size={12} /> Active Context
                </div>
             )}

             <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex gap-4 items-center">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${ws.id === 'ws_acme_prod' ? 'bg-[var(--c-indigo-bg)] border border-[var(--c-indigo)]/30 text-[var(--c-indigo)]' : 'bg-[#15171b] border border-[var(--b3)] text-[var(--t3)]'}`}>
                       <Building2 size={24} />
                     </div>
                     <div>
                       <h2 className="text-[18px] font-semibold text-[var(--t1)] leading-tight">{ws.name}</h2>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-[var(--t3)] bg-[var(--bg-muted)] px-1.5 py-0.5 rounded border border-[var(--b2)]">{ws.id}</span>
                          <span className="text-[10px] text-[var(--c-amber)] uppercase tracking-wider font-semibold border border-[var(--c-amber)]/20 bg-[var(--c-amber-bg)] px-2 py-0.5 rounded">{ws.role}</span>
                       </div>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#0a0c10] border border-[var(--b2)] rounded-lg py-3 px-4">
                       <span className="flex items-center gap-1.5 text-[10px] text-[var(--t3)] uppercase font-semibold mb-2">
                         <Target size={12} className="text-[var(--c-blue)]" /> Cloud Region
                       </span>
                       <span className="text-[14px] font-mono text-[var(--t1)]">{ws.region}</span>
                    </div>
                    <div className="bg-[#0a0c10] border border-[var(--b2)] rounded-lg py-3 px-4">
                       <span className="flex items-center gap-1.5 text-[10px] text-[var(--t3)] uppercase font-semibold mb-2">
                         <Zap size={12} className="text-[var(--c-purple)]" /> Cluster Status
                       </span>
                       <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ws.status === 'Healthy' ? 'bg-[var(--c-green)]' : 'bg-[var(--c-yellow)] animate-pulse'}`}></span>
                          <span className="text-[14px] text-[var(--t1)] font-medium">{ws.status}</span>
                       </div>
                    </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[12px]">
                      <span className="flex items-center gap-2 text-[var(--t3)]"><Database size={14}/> Iceberg Storage Used</span>
                      <span className="font-mono text-[var(--t1)] font-medium">{ws.storage_gb.toLocaleString()} GB</span>
                   </div>
                   <div className="flex justify-between items-center text-[12px]">
                      <span className="flex items-center gap-2 text-[var(--t3)]"><Clock size={14}/> Compute Hours (MTD)</span>
                      <span className="font-mono text-[var(--t1)] font-medium">{ws.compute_hours.toLocaleString()} hrs</span>
                   </div>
                   <div className="flex justify-between items-center text-[12px]">
                      <span className="flex items-center gap-2 text-[var(--t3)]"><Users size={14}/> Member Licenses</span>
                      <span className="font-mono text-[var(--t1)] font-medium">{ws.members} Seats</span>
                   </div>
                </div>
             </div>

             <div className="mt-auto border-t border-[var(--b2)] bg-[#0d1015] px-6 py-4 flex justify-between items-center">
                <span className="text-[12px] text-[var(--t3)] group-hover:text-[var(--t2)] transition-colors">Last synced 2 min ago</span>
                <button className={`text-[13px] font-medium flex items-center gap-1.5 transition-colors ${ws.id === 'ws_acme_prod' ? 'text-[var(--c-indigo)] pointer-events-none' : 'text-[var(--t2)] hover:text-[var(--t1)]'}`}>
                  {ws.id === 'ws_acme_prod' ? 'Current Workspace' : 'Switch Context'} <ArrowRight size={14} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
