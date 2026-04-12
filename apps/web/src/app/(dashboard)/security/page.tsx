"use client";

import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, AlertTriangle, ShieldCheck, Download, Search, Filter, Key, LocateFixed, Clock, Loader2, Info } from "lucide-react";
import { useAuthStore } from "@/stores";

interface SecurityLog {
  id: string;
  event_type: string;
  severity: string;
  description: string;
  actor: string;
  ip_address: string;
  timestamp: string;
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/security/logs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch security logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  const filteredLogs = logs.filter(log => 
    log.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return <ShieldAlert size={16} className="text-[var(--c-red)]" />;
      case 'Medium': return <AlertTriangle size={16} className="text-[var(--c-amber)]" />;
      case 'Low': return <Info size={16} className="text-[var(--c-blue)]" />;
      default: return <ShieldCheck size={16} className="text-[var(--t3)]" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-[var(--c-red-bg)] text-[var(--c-red)] border-[var(--c-red)]/30';
      case 'Medium': return 'bg-[var(--c-amber-bg)] text-[var(--c-amber)] border-[var(--c-amber)]/30';
      case 'Low': return 'bg-[var(--c-blue-bg)] text-[var(--c-blue)] border-[var(--c-blue)]/30';
      default: return 'bg-[var(--bg-muted)] text-[var(--t3)] border-[var(--b2)]';
    }
  };

  return (
    <div className="page-content animate-in h-screen flex flex-col overflow-hidden">
      <div className="page-header shrink-0 mb-6 border-b border-[var(--b2)] pb-4 flex justify-between items-end w-full">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield size={20} className="text-[var(--c-red)]" />
            Enterprise Security Audit
          </h1>
          <p className="page-subtitle">Governance Operations Center (SOC): Track RBAC violations, anomaly detection, and embed exfiltration vectors.</p>
        </div>
        <div className="page-header-actions flex items-center gap-3">
           <div className="flex text-center border border-[var(--b2)] rounded overflow-hidden mr-4 shadow-sm">
              <div className="bg-[var(--bg-card)] px-4 py-1.5 border-r border-[var(--b2)]">
                 <div className="text-[10px] text-[var(--t3)] uppercase font-bold">Total Scans</div>
                 <div className="text-[14px] font-mono text-[var(--t1)]">1.2M</div>
              </div>
              <div className="bg-[var(--c-red-bg)] px-4 py-1.5">
                 <div className="text-[10px] text-[var(--c-red)] uppercase font-bold">Anomalies</div>
                 <div className="text-[14px] font-mono text-[var(--c-red)]">3</div>
              </div>
           </div>
           
           <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
             <Download size={14} className="text-[var(--t3)]" /> Export CSV
           </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 shrink-0">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t3)]" size={16} />
            <input 
              type="text" 
              placeholder="Search threat vectors (e.g. 'RBAC' or 'malicious')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg pl-9 pr-4 py-2 text-[14px] text-[var(--t1)] focus:outline-none focus:border-[var(--c-red)] transition-colors placeholder-[var(--t3)] shadow-sm"
            />
         </div>
         <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
           <Filter size={14} /> Filter Options
         </button>
      </div>

      <div className="flex-1 bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl shadow-sm flex flex-col overflow-hidden mb-6">
         <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-[var(--b2)] bg-[#15171b]">
                     <th className="py-3 px-4 text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider w-10">Lvl</th>
                     <th className="py-3 px-4 text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider w-40">Event Type</th>
                     <th className="py-3 px-4 text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider">Description</th>
                     <th className="py-3 px-4 text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider w-48">Actor Identity</th>
                     <th className="py-3 px-4 text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider w-36">Origin Node</th>
                     <th className="py-3 px-4 text-[11px] font-semibold text-[var(--t3)] uppercase tracking-wider w-32">Timestamp</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--b2)]">
                  {filteredLogs.map(log => (
                     <tr key={log.id} className="hover:bg-[var(--bg-muted)] transition-colors group">
                        <td className="py-3 px-4">
                           {getSeverityIcon(log.severity)}
                        </td>
                        <td className="py-3 px-4">
                           <span className="font-mono text-[12px] font-bold text-[var(--t1)]">
                              {log.event_type}
                           </span>
                        </td>
                        <td className="py-3 px-4">
                           <p className="text-[13px] text-[var(--t2)] group-hover:text-[var(--t1)] transition-colors">
                              {log.description}
                           </p>
                           <div className="flex gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${getSeverityBadge(log.severity)}`}>
                                {log.severity} Threat
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] bg-[var(--bg)] border border-[var(--b2)] text-[var(--t3)] font-mono">
                                {log.id}
                              </span>
                           </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className="flex items-center gap-2 text-[13px] text-[var(--t1)]">
                              <Key size={14} className="text-[var(--t3)] shrink-0"/>
                              <span className="truncate" title={log.actor}>{log.actor}</span>
                           </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className="flex items-center gap-2 text-[13px] font-mono text-[var(--t2)] bg-[#0a0c10] border border-[var(--b2)] px-2 py-1 rounded w-max">
                              <LocateFixed size={12} className="text-[var(--c-blue)]"/>
                              {log.ip_address}
                           </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className="flex items-center gap-1.5 text-[12px] text-[var(--t3)]">
                              <Clock size={12}/>
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                           </div>
                           <div className="text-[10px] text-[var(--t3)] font-mono mt-0.5">
                              {new Date(log.timestamp).toLocaleDateString()}
                           </div>
                        </td>
                     </tr>
                  ))}
                  
                  {filteredLogs.length === 0 && (
                    <tr>
                       <td colSpan={6} className="py-12 text-center text-[var(--t3)]">
                          <ShieldCheck size={32} className="mx-auto mb-3 opacity-50 text-[var(--c-green)]" />
                          <p className="font-medium text-[var(--t1)]">No security anomalies found.</p>
                          <p className="text-[13px] mt-1">Try expanding the search or adjusting the active filters.</p>
                       </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
