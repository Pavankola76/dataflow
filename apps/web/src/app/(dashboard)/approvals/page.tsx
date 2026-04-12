"use client";

import React, { useState, useEffect } from "react";
import { Clock, FileCode, Check, X, Eye, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores";

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [tab, setTab] = useState<"Pending" | "All Requests">("Pending");
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const { token } = useAuthStore();

  const fetchApprovals = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/approvals?status=${tab === "Pending" ? 'pending' : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchApprovals();
  }, [tab, token]);

  const simulateCrash = async () => {
    if (!token) return;
    setSimulating(true);
    await fetch(`http://localhost:8000/api/v1/observability/simulate-outage`, { 
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    setSimulating(false);
    if(tab === "Pending") fetchApprovals();
    else setTab("Pending");
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    await fetch(`http://localhost:8000/api/v1/approvals/${id}/approve`, { 
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchApprovals();
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    await fetch(`http://localhost:8000/api/v1/approvals/${id}/reject`, { 
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchApprovals();
  };

  return (
    <div className="page-content animate-in">
      <div className="page-header !mb-4 flex items-center justify-between">
        <div><h1 className="page-title">Auto-Heal Approvals</h1><p className="page-subtitle">Review and authorize AI-generated architecture patches.</p></div>
        <div className="flex items-center gap-3">
          <div className="awaiting-badge"><Clock size={14} />{requests.length} Requests</div>
          <button onClick={simulateCrash} className="btn-primary flex items-center gap-2 px-4 py-2 bg-[var(--c-red)] hover:bg-[var(--c-red-hover)] border-none text-white font-semibold rounded-md transition-colors shadow-sm">
             {simulating ? <RefreshCw size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
             Simulate Pipeline Crash
          </button>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {(["Pending", "All Requests"] as const).map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? "tab-btn--active" : ""}`} onClick={() => setTab(t)}>
            {t}{t === "Pending" && ` (${requests.length})`}
          </button>
        ))}
      </div>

      <div className="approval-list">
        {loading ? (
            <div className="p-8 text-center text-[var(--t4)] flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" /> Scanning Ledger...</div>
        ) : requests.length === 0 ? (
            <div className="p-8 text-center text-[var(--t4)] font-medium">No pending auto-heal tickets. Engineering systems running normally.</div>
        ) : requests.map((r) => (
          <div key={r.id} className="approval-card">
            <div className="approval-card-top">
              <div className="approval-card-left">
                <div className="approval-icon-wrap"><FileCode size={18} /></div>
                <div>
                  <h3 className="approval-title">{r.request_type === "regenerate_models" ? "Schema Drift Auto-Heal" : "AI Outage Remediation"}</h3>
                  <p className="approval-desc">{r.change_description}</p>
                  <div className="approval-meta">
                    <span className="approval-type text-uppercase">{r.resource_id}</span>
                    <span className="meta-dot" />
                    <span className="flex items-center gap-1"><Zap size={12} color="var(--c-amber)" /> By {r.requested_by}</span>
                    <span className="meta-dot" />
                    <span className="confidence-badge text-[var(--c-amber)] bg-[var(--c-amber-bg)]">95% confidence</span>
                  </div>
                </div>
              </div>
              <div className="approval-actions">
                <button onClick={() => handleApprove(r.id)} disabled={r.status !== 'pending'} className={`btn-approve ${r.status !== 'pending' && 'opacity-50 cursor-not-allowed'}`}><Check size={14} /> Approve</button>
                <button onClick={() => handleReject(r.id)} disabled={r.status !== 'pending'} className={`btn-reject ${r.status !== 'pending' && 'opacity-50 cursor-not-allowed'}`}><X size={14} /> Reject</button>
              </div>
            </div>
            <div className="approval-files bg-[var(--bg-card)]">
              <div className="approval-files-header border-none !pb-0"><Eye size={12} /> Proposed Git Commit Diff ({r.resource_id}.sql)</div>
              <div className="p-4 pt-2">
                 <pre className="text-[12px] font-mono text-[var(--t2)] overflow-x-auto p-3 bg-[var(--bg-surface)] border border-[var(--b2)] rounded-md">
                     {r.diff}
                 </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
