"use client";

import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, Clock, TerminalSquare, AlertOctagon, Filter, Search } from "lucide-react";
import { useAuthStore } from "@/stores";

const API = "http://localhost:8000/api/v1";

interface Alert {
  id: string;
  pipeline_name: string;
  error_type: string;
  message: string;
  severity: "warning" | "critical" | "info";
  detected_at: string;
  status: "open" | "investigating" | "resolved";
  ai_suggestion: string;
}

export default function MonitoringDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "critical" | "warning">("all");
  const { token } = useAuthStore();

  useEffect(() => {
    async function fetchMonitoring() {
      if (!token) return;
      
      const fetchOpts = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [healthRes, alertsRes, violRes] = await Promise.all([
          fetch(`${API}/observability/health`, fetchOpts),
          fetch(`${API}/monitoring/alerts`, fetchOpts),
          fetch(`${API}/contracts/violations?limit=10`, fetchOpts).catch(() => null),
        ]);

        const realAlerts: Alert[] = [];

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          
          for (const alert of alertsData) {
              realAlerts.push({
                id: alert.id,
                pipeline_name: alert.pipeline_name,
                error_type: "PIPELINE_FAILURE",
                message: alert.raw_error_message,
                severity: "critical",
                detected_at: alert.timestamp,
                status: alert.status === "unresolved" ? "open" : alert.status as any,
                ai_suggestion: alert.ai_report ? alert.ai_report.root_cause_analysis : "AI diagnosing...",
              });
          }
        }

        if (violRes && violRes.ok) {
          const violations = await violRes.json();
          for (const viol of (Array.isArray(violations) ? violations : [])) {
            realAlerts.push({
              id: viol.id || `viol-${Math.random()}`,
              pipeline_name: viol.table_name || "Unknown",
              error_type: "DATA_QUALITY",
              message: typeof viol.details === "string" ? viol.details : JSON.stringify(viol.details),
              severity: viol.severity === "critical" ? "critical" : "warning",
              detected_at: viol.created_at || new Date().toISOString(),
              status: "open",
              ai_suggestion: `Review data contract for ${viol.table_name}. Null checks may be too strict for this batch.`,
            });
          }
        }

        if (healthRes.ok) {
          const health = await healthRes.json();
          if (health.status === "Degraded") {
            realAlerts.push({
              id: "health-degraded",
              pipeline_name: "Platform Edge",
              error_type: "SYSTEM_STATUS",
              message: `Platform experiencing degraded performance. Avg latency: ${health.avg_latency_ms}ms.`,
              severity: "warning",
              detected_at: new Date().toISOString(),
              status: "investigating",
              ai_suggestion: "Traffic spike detected. Auto-scaling workers or reducing batch sizes recommended.",
            });
          }
        }

        setAlerts(realAlerts.sort((a,b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()));
      } catch (err) {
        console.error("Failed to fetch monitoring data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  const filteredAlerts = alerts.filter(a => activeTab === "all" || a.severity === activeTab);
  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;

  const getSeverityIcon = (sev: string) => {
    if (sev === "critical") return <AlertOctagon size={16} className="text-[var(--c-red)]" />;
    if (sev === "warning") return <AlertTriangle size={16} className="text-[var(--c-amber)]" />;
    return <Activity size={16} className="text-[var(--c-blue)]" />;
  };

  const getTimeAgo = (dateStr: string) => {
    const min = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (min < 60) return `${Math.max(1, min)}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  return (
    <div className="page-content animate-in relative flex flex-col h-[calc(100vh-60px)]">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Monitoring & Incident Response</h1>
          <p className="page-subtitle">Real-time observability into pipeline executions and data contracts.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-ghost-console"><TerminalSquare size={14} />View Live Logs</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2">
           <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
             <Activity size={15} /> Total Incidents
           </div>
           <div className="text-3xl font-semibold text-white tracking-tight">{loading ? "-" : alerts.length}</div>
           <div className="text-[12px] text-[var(--t3)]">Across all active projects</div>
        </div>
        <div className="section-card p-5 !border-[var(--c-red)]/30 !bg-[#2c1315]/20 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-[var(--c-red)] text-[13px] font-medium uppercase tracking-wider">
             <AlertOctagon size={15} /> Critical Failures
           </div>
           <div className="text-3xl font-semibold text-white tracking-tight">{loading ? "-" : criticalCount}</div>
           <div className="text-[12px] text-[var(--t3)]">pipelines halting</div>
        </div>
        <div className="section-card p-5 !border-[var(--c-amber)]/30 !bg-[#2c2211]/20 flex flex-col gap-2">
           <div className="flex items-center gap-2 text-[var(--c-amber)] text-[13px] font-medium uppercase tracking-wider">
             <AlertTriangle size={15} /> Warnings & Drifts
           </div>
           <div className="text-3xl font-semibold text-white tracking-tight">{loading ? "-" : warningCount}</div>
           <div className="text-[12px] text-[var(--t3)]">schema drifts detected</div>
        </div>
      </div>

      <div className="section-card flex-1 min-h-0 flex flex-col border border-[var(--b2)] rounded-lg shadow-sm">
        <div className="flex justify-between items-center px-4 pt-3 pb-0 border-b border-[var(--b2)] z-10 sticky top-0 bg-[var(--bg-card)] rounded-t-lg">
          <div className="flex gap-6">
            <button onClick={() => setActiveTab("all")} className={`pb-3 text-[13px] font-medium border-b-2 transition-colors ${activeTab === "all" ? "text-white border-[var(--c-brand)]" : "text-[var(--t2)] border-transparent hover:text-white hover:border-[var(--b3)]"}`}>
              All Alerts
            </button>
            <button onClick={() => setActiveTab("critical")} className={`pb-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "critical" ? "text-white border-[var(--c-red)]" : "text-[var(--t2)] border-transparent hover:text-white hover:border-[var(--b3)]"}`}>
               Critical {criticalCount > 0 && <span className="bg-[var(--c-red)]/20 text-[var(--c-red)] px-1.5 py-0.5 rounded text-[10px]">{criticalCount}</span>}
            </button>
            <button onClick={() => setActiveTab("warning")} className={`pb-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "warning" ? "text-white border-[var(--c-amber)]" : "text-[var(--t2)] border-transparent hover:text-white hover:border-[var(--b3)]"}`}>
               Warnings {warningCount > 0 && <span className="bg-[var(--c-amber)]/20 text-[var(--c-amber)] px-1.5 py-0.5 rounded text-[10px]">{warningCount}</span>}
            </button>
          </div>
          <div className="flex items-center gap-2 pb-2">
              <div className="table-search">
                <Search size={13} />
                <input placeholder="Search incidents…" className="bg-transparent border-none outline-none text-[13px] text-[var(--t1)] w-[160px]" />
              </div>
              <button className="btn-icon-sm border border-[var(--b2)] rounded p-1.5 hover:bg-[var(--bg-muted)] transition-colors"><Filter size={13} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-[var(--t3)]">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-[13px]">Loading incident reports...</span>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--t3)] h-full">
              <ShieldCheck size={32} className="text-[var(--c-green)]/70 mb-2" />
              <span className="text-[14px] font-medium text-white">All Clear</span>
              <span className="text-[13px]">No active incidents in the selected view.</span>
            </div>
          ) : (
            <div className="flex flex-col border-t border-[var(--b2)]">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="group flex flex-col p-4 px-5 border-b border-[var(--b1)] hover:bg-[var(--bg-muted)] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                       {getSeverityIcon(alert.severity)}
                       <span className="font-semibold text-[14px] text-white tracking-tight">{alert.pipeline_name}</span>
                       <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#1a1d24] border border-[var(--b2)] text-[var(--t2)]">{alert.error_type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-[var(--t3)] font-medium">
                       <Clock size={12} /> {getTimeAgo(alert.detected_at)}
                    </div>
                  </div>
                  <div className="text-[13px] text-[var(--t2)] pl-[28px] leading-relaxed mb-3">
                    {alert.message}
                  </div>
                  <div className="ml-[28px] bg-[#101317] border border-[var(--b2)] rounded-md p-3 pb-2.5">
                     <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--t3)] mb-2">
                        <TerminalSquare size={12} /> Auto-Resolver AI Recommendation
                     </div>
                     <pre className="font-mono text-[12px] text-[var(--c-purple)] leading-relaxed whitespace-pre-wrap m-0">
                       {alert.ai_suggestion}
                     </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
