"use client";

import React, { useState, useRef, useEffect } from "react";
import PipelineCanvas from "@/components/pipelines/PipelineCanvas";
import { 
  Download, Plus, Search, Filter, GitBranch, Database, Zap, Clock, 
  CheckCircle2, Play, Pause, XCircle, Shield, AlertTriangle, TerminalSquare, X, ChevronUp, ChevronDown, RefreshCw, Loader2, ListTree, Network
} from "lucide-react";
import { useAuthStore } from "@/stores";

const API = "http://localhost:8000/api/v1";

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || "";
  const config: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
    active:    { color: "var(--c-green)", bg: "var(--c-green-bg)", icon: CheckCircle2 },
    running:   { color: "var(--c-blue)",  bg: "var(--c-blue-bg)",  icon: Play },
    succeeded: { color: "var(--c-green)", bg: "var(--c-green-bg)", icon: CheckCircle2 },
    failed:    { color: "var(--c-red)",   bg: "var(--c-red-bg)",   icon: XCircle },
    paused:    { color: "var(--c-amber)", bg: "var(--c-amber-bg)", icon: Pause },
    draft:     { color: "var(--c-amber)", bg: "var(--c-amber-bg)", icon: Pause },
  };
  const c = config[normalized] || config.active;
  const Icon = c.icon;
  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return (
    <span className="status-badge" style={{ color: c.color, background: c.bg }}>
      <Icon size={12} strokeWidth={2.2} />
      {displayStatus}
    </span>
  );
}

interface Pipeline {
  id: string;
  name: string;
  status: string;
  connection_id: string;
  pipeline_type: string;
  strategy: string;
  schedule: string | null;
  config: any;
  created_at: string;
  updated_at: string;
}

interface PipelineRun {
  id: string;
  status: string;
  rows_processed: number;
  started_at: string;
  completed_at: string | null;
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [connections, setConnections] = useState<{id: string, name: string}[]>([]);
  const [latestRuns, setLatestRuns] = useState<Record<string, PipelineRun>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "canvas">("list");
  const { token } = useAuthStore();

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formConnection, setFormConnection] = useState("");
  const [formTable, setFormTable] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Terminal State
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalStatus, setTerminalStatus] = useState<"idle" | "running" | "success">("idle");
  const [activePipeline, setActivePipeline] = useState<string | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Fetch real pipelines from API
  useEffect(() => {
    async function fetchPipelines() {
      if (!token) return;
      
      const fetchOpts = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const res = await fetch(`${API}/pipelines`, fetchOpts);
        if (res.ok) {
          const data = await res.json();
          setPipelines(Array.isArray(data) ? data : []);
          
          // Fetch latest run for each pipeline
          const runMap: Record<string, PipelineRun> = {};
          for (const p of data.slice(0, 20)) {
            try {
              const runRes = await fetch(`${API}/pipelines/${p.id}/runs`, fetchOpts);
              if (runRes.ok) {
                const runs = await runRes.json();
                if (runs.length > 0) {
                  runMap[p.id] = runs[0]; // Most recent run
                }
              }
            } catch {}
          }
          setLatestRuns(runMap);
        }

        // Fetch connections for the dropdown
        const connsRes = await fetch(`${API}/connections`, fetchOpts);
        if (connsRes.ok) {
          const connsData = await connsRes.json();
          setConnections(connsData.map((c: any) => ({id: c.id, name: c.name})));
        }
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPipelines();
  }, [token]);

  const handleCreatePipeline = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formName,
        connection_id: formConnection,
        pipeline_type: "ingestion",
        strategy: "elt",
        config: { table: formTable },
        schedule: "Manual"
      };

      const res = await fetch(`${API}/pipelines`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newPipe = await res.json();
        setPipelines(prev => [newPipe, ...prev]);
        setShowCreateModal(false);
        setFormName("");
        setFormConnection("");
        setFormTable("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerPipelineRun = async (pipeline_id: string, pipeline_name: string) => {
    setTerminalOpen(true);
    setTerminalLogs([`> Deploying extraction cluster for ${pipeline_name}...`]);
    setTerminalStatus("running");
    setActivePipeline(pipeline_name);
    
    // Optimistic UI Update
    setPipelines(prev => prev.map(p => p.id === pipeline_id ? { ...p, status: "running" } : p));
    
    try {
      const res = await fetch(`${API}/pipelines/${pipeline_id}/run/stream`, { 
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.body) return;
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const newLines = text.split('\n');
        setTerminalLogs(prev => [...prev, ...newLines.filter(l => l.length > 0)]);
      }
      setTerminalStatus("success");
      setPipelines(prev => prev.map(p => p.id === pipeline_id ? { ...p, status: "succeeded" } : p));
    } catch(e) {
      setTerminalLogs(prev => [...prev, "> System Error: Execution Connection Failed", String(e)]);
      setTerminalStatus("idle");
      setPipelines(prev => prev.map(p => p.id === pipeline_id ? { ...p, status: "failed" } : p));
    }
  }

  // Helper for colored logs
  const renderLogLine = (line: string, index: number) => {
     let color = "text-[var(--t2)]";
     if (line.includes("PASS") || line.includes("[OK") || line.includes("successfully") || line.includes("OK created")) color = "text-[var(--c-green)]";
     else if (line.includes("ERROR") || line.includes("FAIL")) color = "text-[var(--c-red)]";
     else if (line.includes("START")) color = "text-[var(--c-blue)]";
     else if (line.includes("WARN")) color = "text-[var(--c-amber)]";
     
     return <div key={index} className={`font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap ${color}`}>{line}</div>
  }

  const getLastRunInfo = (pipelineId: string) => {
    const run = latestRuns[pipelineId];
    if (!run) return { lastRun: "Never", rows: "0", runStatus: null };
    const time = run.completed_at || run.started_at;
    return {
      lastRun: run.status === "running" ? "Running now…" : getRelativeTime(time),
      rows: (run.rows_processed || 0).toLocaleString(),
      runStatus: run.status,
    };
  };

  return (
    <div className="page-content animate-in relative flex flex-col h-[calc(100vh-60px)]">
      <div className="page-header shrink-0">
        <div><h1 className="page-title">Pipelines</h1><p className="page-subtitle">Monitor and natively execute your data transformation pipelines.</p></div>
        <div className="page-header-actions">
          <button className="btn-ghost-console"><Download size={14} />Import pipeline</button>
          <button className="btn-primary-console" onClick={() => setShowCreateModal(true)}><Plus size={14} />Create pipeline</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
              <GitBranch size={15} /> Total Pipelines
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">{loading ? "-" : pipelines.length}</div>
            <div className="text-[12px] text-[var(--t3)]">Configured in account</div>
         </div>
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[var(--c-blue-bg)] to-transparent opacity-30 group-hover:opacity-60 transition-opacity"></div>
            <div className="flex items-center gap-2 text-[var(--c-blue)] text-[13px] font-medium uppercase tracking-wider opacity-90">
              <RefreshCw size={15} className={pipelines.some(p => p.status === "running") ? "animate-spin" : ""} /> Active Runs
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">{loading ? "-" : pipelines.filter(p => p.status === "running").length}</div>
            <div className="text-[12px] text-[var(--t3)]">Deployments executing</div>
         </div>
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
              <Database size={15} /> Total Rows Ingested
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">
               {loading ? "-" : Object.values(latestRuns).reduce((acc, r) => acc + (r.rows_processed || 0), 0).toLocaleString()}
            </div>
            <div className="text-[12px] text-[var(--t3)]">Across latest executions</div>
         </div>
      </div>

      <div className="section-card flex flex-col flex-1 min-h-0 border border-[var(--b2)] rounded-lg shadow-sm mb-4">
        <div className="section-card-header sticky top-0 bg-[var(--bg-card)] z-10 p-4 border-b border-[var(--b2)] flex justify-between items-center">
            <h2 className="section-card-title m-0">
              {loading ? "Loading pipelines..." : `Configured pipelines (${pipelines.length})`}
            </h2>
            <div className="table-header-right flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-[var(--bg-muted)] border border-[var(--b2)] rounded-md p-1">
                 <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded transition-colors ${viewMode === 'list' ? 'bg-[var(--bg-card)] text-white shadow-sm' : 'text-[var(--t3)] hover:text-white'}`}>
                    <ListTree size={14} /> List
                 </button>
                 <button onClick={() => setViewMode("canvas")} className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium rounded transition-colors ${viewMode === 'canvas' ? 'bg-[var(--bg-card)] text-white shadow-sm' : 'text-[var(--t3)] hover:text-white'}`}>
                    <Network size={14} /> Map
                 </button>
              </div>

              <div className="w-[1px] h-5 bg-[var(--b2)] mx-1"></div>

              <div className="table-search">
                <Search size={13} />
                <input placeholder="Find resources…" className="bg-transparent border-none outline-none text-[13px] text-[var(--t1)]" />
              </div>
              <button className="btn-icon-sm border border-[var(--b2)] rounded p-1.5 hover:bg-[var(--bg-muted)] transition-colors"><Filter size={13} /></button>
            </div>
        </div>

        <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto">
          {viewMode === "canvas" ? (
             <PipelineCanvas />
          ) : loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-[var(--t3)]">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-[13px]">Fetching pipelines from database...</span>
            </div>
          ) : pipelines.length === 0 ? (
            <div className="text-center py-12 text-[var(--t3)] text-[13px]">No pipelines configured yet. Create one to get started.</div>
          ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--b2)] bg-[var(--bg-muted)]">
                <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Schedule</th>
                <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider">Last run</th>
                <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider text-right">Rows</th>
                <th className="px-5 py-3 text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bg-card)]">
              {pipelines.map((p) => {
                const runInfo = getLastRunInfo(p.id);
                const displayStatus = runInfo.runStatus || p.status;
                return (
                <tr key={p.id} className="border-b border-[var(--b1)] hover:bg-[var(--bg-muted)] transition-colors group">
                  <td className="px-5 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <GitBranch size={15} className="text-[var(--t4)]" />
                      <span className="font-semibold text-[13px] text-[var(--t1)]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 align-middle"><StatusBadge status={displayStatus} /></td>
                  <td className="px-5 py-3 align-middle"><span className="flex items-center gap-1.5 text-[12px] text-[var(--t2)]"><Database size={13} className="text-[var(--t4)]" />{p.pipeline_type || "ingestion"}</span></td>
                  <td className="px-5 py-3 align-middle"><span className="flex items-center gap-1.5 text-[12px] text-[var(--t2)]"><Zap size={13} className="text-[var(--c-amber)]" />{p.schedule || "Manual"}</span></td>
                  <td className="px-5 py-3 align-middle"><span className="flex items-center gap-1.5 text-[12px] text-[var(--t3)]"><Clock size={13} />{runInfo.lastRun}</span></td>
                  <td className="px-5 py-3 align-middle text-right"><span className="font-mono text-[12px] text-[var(--t2)] bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--b1)]">{runInfo.rows}</span></td>
                  <td className="px-5 py-3 align-middle text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => triggerPipelineRun(p.id, p.name)}
                          disabled={displayStatus === "running"}
                          className="flex items-center justify-center bg-[var(--c-blue)] hover:bg-[var(--c-blue-hover)] text-white w-7 h-7 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Deploy & Run"
                        >
                          {displayStatus === "running" ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} className="ml-0.5" />}
                        </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1115] border border-[var(--b2)] w-full max-w-[450px] rounded-lg shadow-xl shadow-black/50 animate-in flex flex-col">
            <div className="p-5 border-b border-[var(--b2)] flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-[var(--t1)] m-0 flex items-center gap-2">
                <GitBranch size={16} /> New Extraction Pipeline
              </h2>
              <button className="hover:text-white transition-colors" onClick={() => setShowCreateModal(false)}><X size={16} /></button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--t2)] mb-1 uppercase tracking-wider">Pipeline Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg-muted)] border border-transparent rounded h-[34px] px-3 outline-none text-[13px] text-white focus:border-[var(--c-brand)] focus:bg-[#1a1d24] transition-colors"
                  placeholder="e.g. Kaggle Sales Daily"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--t2)] mb-1 uppercase tracking-wider">Source Connection</label>
                <select 
                  className="w-full bg-[var(--bg-muted)] border border-transparent rounded h-[34px] px-3 flex items-center outline-none text-[13px] text-white focus:border-[var(--c-brand)] focus:bg-[#1a1d24] transition-colors"
                  value={formConnection}
                  onChange={e => setFormConnection(e.target.value)}
                >
                  <option value="" disabled>Select a stored connection...</option>
                  {connections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--t2)] mb-1 uppercase tracking-wider">Source Table Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[var(--bg-muted)] border border-transparent rounded h-[34px] px-3 outline-none text-[13px] text-white focus:border-[var(--c-brand)] focus:bg-[#1a1d24] transition-colors"
                  placeholder="e.g. ecommerce_sales"
                  value={formTable}
                  onChange={e => setFormTable(e.target.value)}
                />
                <p className="text-[11px] text-[var(--t3)] mt-1 ml-1 flex items-center gap-1">
                  <Database size={11}/> The exact table mapped inside the selected connection.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--b2)] bg-[var(--bg-muted)] rounded-b-lg flex justify-end gap-2 shrink-0">
              <button className="btn-ghost-console !h-[34px] hover:text-white" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                className="btn-primary-console !h-[34px]" 
                disabled={!formName || !formConnection || !formTable || isSubmitting}
                onClick={handleCreatePipeline}
              >
                {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Provisioning</> : "Create Pipeline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Terminal Engine UI */}
      <div 
         className={`shrink-0 bg-[#0d1117] border border-[var(--b2)] rounded-t-lg transition-all duration-300 ease-in-out shadow-[0_-4px_24px_rgba(0,0,0,0.15)] z-20 overflow-hidden ${terminalOpen ? 'h-[300px]' : 'h-0 border-transparent'}`}
      >
        <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] flex justify-between items-center text-[#c9d1d9]">
           <div className="flex items-center gap-2 text-[12px] font-mono tracking-wide">
              <TerminalSquare size={14} className="text-[var(--c-blue)]" /> 
              PHYSICAL EXECUTION ENGINE 
              {activePipeline && <span className="opacity-60 ml-2">[{activePipeline}]</span>}
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 mr-2">
                 {terminalStatus === "running" && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--c-amber)] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--c-amber)]"></span></span>}
                 {terminalStatus === "success" && <span className="flex h-2 w-2 relative"><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--c-green)]"></span></span>}
                 <span className="text-[11px] font-mono capitalize">{terminalStatus}</span>
              </div>
              <button className="hover:text-white transition-colors"><ChevronUp size={14} /></button>
              <button className="hover:text-white transition-colors" onClick={() => setTerminalOpen(false)}><X size={14} /></button>
           </div>
        </div>
        <div className="p-4 h-[calc(100%-40px)] overflow-y-auto font-mono text-[12px] bg-[#0d1117] text-[#8b949e]">
           {terminalLogs.length === 0 ? (
             <div className="opacity-50">Waiting for subprocess cluster attachment...</div>
           ) : (
             <div className="space-y-1">
                {terminalLogs.map((log, i) => renderLogLine(log, i))}
                <div ref={terminalEndRef} />
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
