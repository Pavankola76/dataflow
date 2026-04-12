"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowRightLeft, Plus, Play, MoreHorizontal, Database, CheckCircle2, 
  Cloud, MessageSquare, Briefcase, RefreshCw, X, ArrowRight, Layers
} from "lucide-react";
import { useAuthStore } from "@/stores";

const DESTINATIONS = [
  { id: "salesforce", name: "Salesforce", icon: Cloud, color: "#00a1e0" },
  { id: "hubspot", name: "HubSpot", icon: Briefcase, color: "#ff7a59" },
  { id: "slack", name: "Slack", icon: MessageSquare, color: "#4a154b" }
];

const SOURCES = [
  "fact_orders", "dim_customers", "customer_lifetime_value"
];

export default function SyncsPage() {
  const [syncs, setSyncs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSource, setFormSource] = useState(SOURCES[0]);
  const [formDest, setFormDest] = useState(DESTINATIONS[0].id);
  const [triggering, setTriggering] = useState<string | null>(null);

  const { token } = useAuthStore();

  const fetchSyncs = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/reverse-etl/syncs", {
         headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSyncs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncs();
  }, []);

  const handleCreateSync = async () => {
    if (!formName.trim()) return;
    setSubmitting(true);
    await fetch("http://localhost:8000/api/v1/reverse-etl/syncs", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        name: formName,
        source_table: formSource,
        destination_type: formDest,
        sync_mode: "incremental",
        schedule: "0 * * * *" // Hourly
      })
    });
    setSubmitting(false);
    setShowBuilder(false);
    setFormName("");
    fetchSyncs();
  };

  const handleTrigger = async (id: string) => {
    setTriggering(id);
    await fetch(`http://localhost:8000/api/v1/reverse-etl/syncs/${id}/run`, { 
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
    });
    fetchSyncs();
    setTriggering(null);
  };

  const getDest = (d_id: string) => DESTINATIONS.find(d => d.id === d_id) || DESTINATIONS[0];

  return (
    <div className="page-content animate-in relative">
      <div className="page-header flex justify-between items-center bg-[var(--bg-surface)] p-6 rounded-lg border border-[var(--b2)] mb-6 shadow-sm">
        <div>
          <h1 className="page-title flex items-center gap-2"><ArrowRightLeft size={24} className="text-[var(--c-blue)]" /> Reverse ETL</h1>
          <p className="page-subtitle mt-1">Push your cleansed Gold-Layer data into downstream SaaS destinations.</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="btn-primary flex items-center gap-2 px-4 py-2 bg-[var(--c-purple)] hover:bg-[var(--c-purple-hover)] border-none text-white font-semibold rounded-md transition-colors shadow-sm">
          <Plus size={16} /> New Sync
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-[var(--t4)]">
          <RefreshCw size={24} className="animate-spin" />
        </div>
      ) : syncs.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-card)] rounded-xl border border-[var(--b2)] border-dashed">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-muted)] flex items-center justify-center mb-4">
              <ArrowRightLeft size={32} className="text-[var(--t4)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--t1)] mb-2">No active syncs</h3>
            <p className="text-[var(--t3)] text-center max-w-sm mb-6">Create your first Reverse ETL connection to automatically distribute warehouse insights.</p>
            <button onClick={() => setShowBuilder(true)} className="btn-ghost-console"><Plus size={16} /> Get Started</button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {syncs.map(sync => {
            const DestInfo = getDest(sync.destination_type);
            const DestIcon = DestInfo.icon;
            return (
              <div key={sync.id} className="card hover:border-[var(--c-blue)] transition-all group overflow-hidden bg-[var(--bg-card)] rounded-xl border border-[var(--b2)] shadow-sm">
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ background: DestInfo.color }}>
                        <DestIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--t1)] truncate w-40">{sync.name}</h4>
                        <div className="flex items-center gap-1 text-[12px] text-[var(--t3)] mt-1">
                          <CheckCircle2 size={12} className="text-[var(--c-green)]" /> Active Sync
                        </div>
                      </div>
                    </div>
                    <button className="text-[var(--t4)] hover:text-[var(--t1)] transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-6 p-3 bg-[var(--bg-base)] rounded-lg text-[13px] font-mono border border-[var(--b1)] mt-auto">
                    <div className="flex flex-col justify-center w-[40%]">
                       <span className="text-[var(--t2)] text-center truncate px-1" title={sync.source_table}>{sync.source_table}</span>
                    </div>
                    <div className="flex-1 flex justify-center text-[var(--t4)]">
                        <ArrowRight size={14} />
                    </div>
                    <div className="flex flex-col justify-center w-[40%]">
                       <span className="text-[var(--t2)] text-center truncate px-1">{DestInfo.name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--b1)]">
                    <div className="text-[12px] text-[var(--t4)]">
                      Last run: {sync.last_run ? new Date(sync.last_run).toLocaleTimeString() : 'Never'}
                    </div>
                    <button 
                       onClick={() => handleTrigger(sync.id)}
                       disabled={triggering === sync.id}
                       className="p-2 rounded-md hover:bg-[var(--bg-muted)] text-[var(--c-blue)] transition-colors disabled:opacity-50"
                       title="Run Now"
                    >
                      {triggering === sync.id ? <RefreshCw size={16} className="animate-spin text-[var(--t4)]" /> : <Play size={16} />}
                    </button>
                  </div>
                </div>
                {/* Active running pulse bar */}
                {triggering === sync.id && <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--c-blue)] to-transparent animate-pulse" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Sync Builder Slide-Over */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-end animate-in fade-in duration-200" onClick={() => setShowBuilder(false)}>
          <div className="w-[500px] h-full bg-[var(--bg-surface)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--b2)]">
              <h2 className="text-xl font-semibold flex items-center gap-2"><ArrowRightLeft size={20} className="text-[var(--c-blue)]" /> Map New Destination</h2>
              <button onClick={() => setShowBuilder(false)} className="text-[var(--t3)] hover:text-[var(--t1)]"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-medium text-[var(--t2)] mb-2">Sync Pipeline Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Daily VIP Customers to Salesforce"
                  className="w-full bg-[var(--bg-base)] border border-[var(--b2)] rounded-md px-3 py-2 text-[var(--t1)] outline-none focus:border-[var(--c-blue)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--t2)] mb-2">Source Model (Gold Layer)</label>
                <div className="grid grid-cols-1 gap-2">
                  {SOURCES.map(s => (
                    <div 
                      key={s} 
                      onClick={() => setFormSource(s)}
                      className={`p-3 rounded-md border text-[13px] font-mono cursor-pointer transition-all flex items-center gap-2 ${formSource === s ? 'border-[var(--c-blue)] bg-[var(--c-blue-bg)] text-[var(--c-blue)]' : 'border-[var(--b2)] bg-[var(--bg-card)] hover:border-[var(--b3)] text-[var(--t2)]'}`}
                    >
                      <Database size={15} /> {s}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[var(--t2)] mb-2">SaaS Destination</label>
                <div className="grid grid-cols-3 gap-3">
                  {DESTINATIONS.map(d => {
                    const Icon = d.icon;
                    return (
                      <div 
                        key={d.id} 
                        onClick={() => setFormDest(d.id)}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${formDest === d.id ? 'border-[var(--c-blue)] bg-[var(--c-blue-bg)]' : 'border-[var(--b2)] bg-[var(--bg-card)] hover:bg-[var(--bg-muted)]'}`}
                      >
                        <Icon size={24} style={{ color: d.color }} />
                        <span className={`text-[12px] font-medium ${formDest === d.id ? 'text-[var(--c-blue)]' : 'text-[var(--t2)]'}`}>{d.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-4 bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg text-center shadow-sm">
                 <div className="w-10 h-10 mx-auto rounded-full bg-[var(--c-purple-bg)] flex items-center justify-center mb-2">
                    <Layers size={18} className="text-[var(--c-purple)]" />
                 </div>
                 <h4 className="text-[13px] font-medium text-[var(--t2)]">Automatic AI Blueprint Active</h4>
                 <p className="text-[12px] text-[var(--t4)] mt-1">DataFlow AI will dynamically map standard column names (e.g. `customer_id` → `Contact ID`) natively via the LangGraph Engine during the first sync sequence.</p>
              </div>

            </div>

            <div className="p-6 border-t border-[var(--b2)] flex justify-end gap-3 bg-[var(--bg-base)]">
              <button onClick={() => setShowBuilder(false)} className="px-4 py-2 border border-[var(--b2)] text-[var(--t2)] rounded-md hover:bg-[var(--bg-muted)] transition-colors text-[13px] font-medium">Cancel</button>
              <button 
                onClick={handleCreateSync}
                disabled={submitting || !formName.trim()}
                className="px-4 py-2 flex items-center gap-2 bg-[var(--c-blue)] hover:bg-[var(--c-blue-hover)] text-white border-none rounded-md transition-colors shadow-sm text-[13px] font-medium disabled:opacity-50"
              >
                {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />} Compile & Deploy Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
