"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Clock, Target, Loader2, Database, TableProperties, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores";

interface ExpectationResult {
  expectation_type: string;
  column: string;
  success: boolean;
  unexpected_count?: number;
  unexpected_percent?: number;
  message: string;
}

interface ValidationSuite {
  id: string;
  name: string;
  dataset: string;
  status: string;
  passed_count: number;
  failed_count: number;
  last_run: string;
  results: ExpectationResult[];
}

export default function DataQualityPage() {
  const [suites, setSuites] = useState<ValidationSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSuiteId, setExpandedSuiteId] = useState<string | null>(null);

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchSuites = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/quality/suites", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const suitesArray = Array.isArray(data) ? data : [];
        setSuites(suitesArray);
        if (suitesArray.length > 0) {
          setExpandedSuiteId(suitesArray[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch data quality suites", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuites();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  const totalSuites = suites.length;
  const failedSuites = suites.filter(s => s.status === 'Failed').length;
  const totalPassedChecks = suites.reduce((acc, s) => acc + s.passed_count, 0);
  const totalFailedChecks = suites.reduce((acc, s) => acc + s.failed_count, 0);

  return (
    <div className="page-content animate-in h-screen flex flex-col overflow-hidden">
      <div className="page-header shrink-0 mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert size={20} className="text-[var(--c-purple)]" />
            Data Quality Profiling
          </h1>
          <p className="page-subtitle">Monitor heuristic Great Expectations validation logic across all physical lakehouse entities.</p>
        </div>
        <div className="page-header-actions">
           <button className="bg-[var(--bg-muted)] hover:bg-[var(--bg-card)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2">
             <Target size={14} /> View Execution Logs
           </button>
           <button className="bg-[var(--c-purple)] hover:bg-purple-500 text-white border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
             <Sparkles size={14} /> Generate AI Validations
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
              <Database size={15} /> Active Suites
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">{totalSuites}</div>
            <div className="text-[12px] text-[var(--t3)]">across catalog</div>
         </div>
         <div className="section-card p-5 !border-[var(--c-red)]/30 !bg-[#2c1315]/20 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 blur-3xl opacity-20 rounded-full"></div>
            <div className="flex items-center gap-2 text-[var(--c-red)] text-[13px] font-medium uppercase tracking-wider opacity-90">
              <AlertTriangle size={15} /> Suites Failing
            </div>
            <div className="text-3xl font-semibold text-[var(--c-red)] tracking-tight">{failedSuites}</div>
            <div className="text-[12px] text-[var(--t3)]">require attention</div>
         </div>
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
              <CheckCircle2 size={15} className="text-[var(--c-green)]" /> Rules Passed
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">{totalPassedChecks}</div>
            <div className="text-[12px] text-[var(--t3)]">heuristic validations</div>
         </div>
         <div className="section-card p-5 !border-[var(--b2)] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[var(--t2)] text-[13px] font-medium uppercase tracking-wider">
              <AlertCircle size={15} className="text-[var(--c-red)]" /> Anomalies
            </div>
            <div className="text-3xl font-semibold text-white tracking-tight">{totalFailedChecks}</div>
            <div className="text-[12px] text-[var(--t3)]">data contract drifts</div>
         </div>
      </div>

      <div className="section-card flex flex-col flex-1 min-h-0 border border-[var(--b2)] rounded-lg shadow-sm">
        <div className="section-card-header sticky top-0 bg-[var(--bg-card)] z-10 p-4 border-b border-[var(--b2)]">
            <h2 className="section-card-title m-0 flex items-center gap-2 text-[14px]">
              <ShieldCheck size={16} className="text-[var(--c-purple)]"/> Expected Rulesets & Validations
            </h2>
        </div>
        <div className="flex-1 overflow-y-auto w-full">
          <div className="flex flex-col">
            {suites.map((suite) => {
              const isExpanded = expandedSuiteId === suite.id;
              
              return (
                <div key={suite.id} className={`flex flex-col border-b border-[var(--b1)] transition-colors ${suite.status === 'Passed' ? 'hover:bg-[var(--bg-muted)]' : 'bg-[#150d11]/40 border-[var(--c-red)]/20'}`}>
                   {/* Suite Header Header */}
                   <div 
                     onClick={() => setExpandedSuiteId(isExpanded ? null : suite.id)}
                     className="cursor-pointer px-5 py-4 flex items-center justify-between"
                   >
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-full ${suite.status === 'Passed' ? 'bg-[var(--c-green-bg)] text-[var(--c-green)]' : 'bg-[var(--c-red-bg)] text-[var(--c-red)]'}`}>
                           {suite.status === 'Passed' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                         </div>
                         <div>
                            <h3 className="text-[14px] font-semibold text-white tracking-tight flex items-center gap-2">
                               {suite.name}
                               <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${suite.status === 'Passed' ? 'border-[var(--c-green)] bg-[var(--c-green-bg)] text-[var(--c-green)]' : 'border-[var(--c-red)] bg-[var(--c-red-bg)] text-[var(--c-red)]'}`}>
                                  {suite.status}
                               </span>
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-[12px] font-mono text-[var(--t3)] font-medium">
                               <span className="flex items-center gap-1.5"><TableProperties size={12} className="text-[var(--c-blue)]"/> {suite.dataset}</span>
                               <span>•</span>
                               <span className="flex items-center gap-1"><Clock size={12}/> Run {new Date(suite.last_run).toLocaleTimeString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-4 text-[13px] font-mono font-bold">
                           <div className="flex flex-col items-center">
                             <span className="text-[var(--c-green)]">{suite.passed_count}</span>
                             <span className="text-[9px] text-[var(--t3)] uppercase tracking-wider">Passed</span>
                           </div>
                           <div className="flex flex-col items-center">
                             <span className={suite.failed_count > 0 ? "text-[var(--c-red)]" : "text-[var(--t3)]"}>{suite.failed_count}</span>
                             <span className="text-[9px] text-[var(--t3)] uppercase tracking-wider">Failed</span>
                           </div>
                         </div>
                         <div className="text-[var(--t3)]">
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                         </div>
                      </div>
                   </div>

                   {/* Suite Content (Expectations) */}
                   {isExpanded && (
                     <div className="bg-[#0a0d14] border-t border-[var(--b1)] p-5">
                        <div className="space-y-2">
                          {suite.results.map((result, idx) => (
                            <div key={idx} className="group flex items-start gap-4 p-3 hover:bg-[var(--bg-muted)] rounded border border-transparent transition-colors">
                               <div className="mt-0.5 shrink-0">
                                 {result.success ? (
                                   <CheckCircle2 size={16} className="text-[var(--c-green)]" />
                                 ) : (
                                   <AlertCircle size={16} className="text-[var(--c-red)]" />
                                 )}
                               </div>
                               <div className="flex-1">
                                 <div className="flex items-center justify-between mb-1 text-[13px]">
                                    <div className="font-mono text-white font-medium">
                                      <span className="text-[var(--c-blue)]">{result.column}</span>
                                      <span className="text-[var(--t3)] mx-2">→</span>
                                      <span className={result.success ? "text-[var(--t2)]" : "text-[var(--c-red)] font-semibold"}>{result.expectation_type}</span>
                                    </div>
                                 </div>
                                 <p className="text-[13px] text-[var(--t2)] leading-relaxed">
                                    {result.message}
                                 </p>
                                 
                                 {!result.success && result.unexpected_count !== undefined && (
                                    <div className="mt-4 flex items-center gap-3">
                                      <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded flex flex-col items-start min-w-[120px]">
                                         <span className="text-[10px] text-[var(--c-red)] uppercase tracking-wider font-bold opacity-80 mb-0.5">Unexpected</span>
                                         <span className="text-[15px] font-mono text-[var(--c-red)] font-semibold">{result.unexpected_count} row{result.unexpected_count !== 1 && 's'}</span>
                                      </div>
                                      <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded flex flex-col items-start min-w-[120px]">
                                         <span className="text-[10px] text-[var(--c-red)] uppercase tracking-wider font-bold opacity-80 mb-0.5">Anomaly Rate</span>
                                         <span className="text-[15px] font-mono text-[var(--c-red)] font-semibold">~{(result.unexpected_percent! * 100).toFixed(2)}%</span>
                                      </div>
                                    </div>
                                 )}
                               </div>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
