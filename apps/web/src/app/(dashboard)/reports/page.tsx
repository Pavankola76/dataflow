"use client";

import React, { useState, useEffect } from "react";
import { FolderClock, Clock, Mail, CheckCircle2, AlertCircle, Play, Calendar, Database, Sparkles, Loader2, FileJson, ArrowRight, MoreVertical } from "lucide-react";
import { useAuthStore } from "@/stores";

interface Report {
  id: string;
  name: string;
  description: string;
  query: string;
  schedule: string;
  recipients: string[];
  last_run: string;
  next_run: string;
  status: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchReports = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/reports/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setReports(data);
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error("Failed to fetch scheduled reports", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page-content animate-in h-screen overflow-y-auto">
      <div className="page-header shrink-0 mb-8 border-b border-[var(--b2)] pb-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FolderClock size={20} className="text-[var(--c-indigo)]" />
            Scheduled Reports & AI Queries
          </h1>
          <p className="page-subtitle">Persist generative DuckDB analytics into automated CRON-triggered email dispatches.</p>
        </div>
        <div className="page-header-actions">
           <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
             <FileJson size={14} className="text-[var(--t3)]" /> Import Query
           </button>
           <button className="bg-[var(--c-indigo)] hover:bg-indigo-500 text-white border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
             <Calendar size={14} /> New Schedule
           </button>
        </div>
      </div>

      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl shadow-sm overflow-hidden hover:border-[var(--b3)] transition-colors group relative">
             
             {/* Decorative Background */}
             <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[var(--c-indigo-bg)] to-transparent opacity-10 pointer-events-none"></div>
             
             <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-[var(--c-indigo-bg)] border border-[var(--c-indigo)]/30 flex items-center justify-center shadow-inner">
                        <Sparkles size={18} className="text-[var(--c-indigo)]" />
                     </div>
                     <div>
                       <h2 className="text-[16px] font-semibold text-[var(--t1)] flex items-center gap-2">
                         {report.name}
                         <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--b2)] bg-[var(--bg-muted)] text-[var(--t2)] font-mono">
                           {report.id}
                         </span>
                       </h2>
                       <p className="text-[13px] text-[var(--t3)] mt-0.5 leading-snug max-w-[80%]">
                         {report.description}
                       </p>
                     </div>
                  </div>
                  
                  <button className="p-1.5 text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--bg-muted)] rounded transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="mb-5 bg-[#0d1117] border border-[var(--b2)] rounded-lg p-3 overflow-x-auto">
                   <pre className="text-[12px] font-mono text-[var(--c-purple)] leading-relaxed">
                      {report.query}
                   </pre>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--b2)]">
                   
                   {/* Schedule Info */}
                   <div>
                     <span className="flex items-center gap-1.5 text-[11px] text-[var(--t3)] uppercase font-semibold mb-1">
                       <Clock size={12} /> Schedule
                     </span>
                     <div className="flex items-center gap-2 text-[13px] font-mono text-[var(--t1)] bg-[var(--bg-muted)] border border-[var(--b2)] px-2.5 py-1 rounded w-max">
                       <span className="text-[var(--c-amber)]">{report.schedule}</span>
                     </div>
                   </div>

                   {/* Next Run Info */}
                   <div>
                     <span className="flex items-center gap-1.5 text-[11px] text-[var(--t3)] uppercase font-semibold mb-1">
                       <Calendar size={12} /> Next Execution
                     </span>
                     <div className="text-[13px] text-[var(--t1)] font-medium">
                       {new Date(report.next_run).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div className="text-[11px] text-[var(--t3)]">
                       Last run: {new Date(report.last_run).toLocaleDateString()}
                     </div>
                   </div>

                   {/* Recipients Info */}
                   <div className="col-span-2 flex justify-between items-center">
                      <div>
                        <span className="flex items-center gap-1.5 text-[11px] text-[var(--t3)] uppercase font-semibold mb-1">
                          <Mail size={12} /> Recipients
                        </span>
                        <div className="flex items-center gap-2">
                          {report.recipients.map((email, idx) => (
                             <span key={idx} className="text-[11px] bg-[var(--bg-muted)] border border-[var(--b2)] px-2 py-0.5 rounded-full text-[var(--t2)]">
                               {email}
                             </span>
                          ))}
                        </div>
                      </div>
                      
                      <button className="flex items-center gap-2 bg-[var(--c-blue-bg)] hover:bg-[var(--c-blue)]/20 text-[var(--c-blue)] border border-[var(--c-blue)] px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors shadow-sm">
                        <Play size={14} className="fill-[var(--c-blue)]" /> Run Now
                      </button>
                   </div>
                   
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
