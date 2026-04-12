"use client";

import React, { useState, useEffect } from "react";
import { Gauge, Activity, Database, Zap, Cpu, Server, ServerCrash, ArrowUpRight, Loader2, Link2, ShieldAlert } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuthStore } from "@/stores";

interface PerformanceSnapshot {
  timestamp: string;
  llm_latency_ms: number;
  iceberg_iops: number;
  spark_ram_gb: number;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/performance/metrics", {
           headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setMetrics(data);
        } else {
          setMetrics([]);
        }
      } catch (err) {
        console.error("Failed to fetch performance metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
    
    // Simulate real-time polling
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  // Calculate some simple aggregates for the KPI cards
  const latest = metrics[metrics.length - 1] || { llm_latency_ms: 0, iceberg_iops: 0, spark_ram_gb: 0 };
  const maxLatency = Math.max(...metrics.map(m => m.llm_latency_ms));
  const maxIops = Math.max(...metrics.map(m => m.iceberg_iops));

  return (
    <div className="page-content animate-in h-screen overflow-y-auto pb-12">
      <div className="page-header shrink-0 mb-8 border-b border-[var(--b2)] pb-4 flex justify-between items-center w-full">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Gauge size={20} className="text-[var(--c-blue)]" />
            Performance & Load Testing
          </h1>
          <p className="page-subtitle">Monitor overarching LLM cognitive latencies, storage IOPS, and dynamic memory allocations.</p>
        </div>
        <div className="page-header-actions">
           <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
             <ServerCrash size={14} className="text-[var(--c-amber)]" /> Stress Test Cluster
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[var(--c-purple)]/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-purple)]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[var(--c-purple)]/20 transition-all"></div>
            <div className="flex justify-between items-start mb-2 relative">
               <span className="text-[12px] font-semibold text-[var(--t3)] uppercase tracking-wider flex items-center gap-1.5"><Zap size={14} className="text-[var(--c-purple)]"/> LLM Inference</span>
               <span className={`text-[12px] flex items-center gap-1 bg-[#15171b] px-2 py-0.5 rounded border ${latest.llm_latency_ms > 200 ? 'text-[var(--c-red)] border-[var(--c-red)]/30' : 'text-[var(--c-green)] border-[var(--c-green)]/30'}`}>
                 <ArrowUpRight size={12}/> {latest.llm_latency_ms > 200 ? '+14%' : '-2%'}
               </span>
            </div>
            <div className="relative">
               <span className="text-3xl font-mono font-bold text-[var(--t1)]">{latest.llm_latency_ms}</span>
               <span className="text-[14px] text-[var(--t3)] ml-2">ms rtt</span>
            </div>
            <p className="text-[11px] text-[var(--t3)] mt-2 font-mono flex items-center gap-1">
               <Activity size={10} className="text-[var(--t3)]"/> 24h Peak: {maxLatency}ms
            </p>
         </div>

         <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[var(--c-blue)]/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-blue)]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[var(--c-blue)]/20 transition-all"></div>
            <div className="flex justify-between items-start mb-2 relative">
               <span className="text-[12px] font-semibold text-[var(--t3)] uppercase tracking-wider flex items-center gap-1.5"><Database size={14} className="text-[var(--c-blue)]"/> Iceberg IOPS</span>
               <span className={`text-[12px] flex items-center gap-1 bg-[#15171b] px-2 py-0.5 rounded border ${latest.iceberg_iops > 4000 ? 'text-[var(--c-amber)] border-[var(--c-amber)]/30' : 'text-[var(--c-green)] border-[var(--c-green)]/30'}`}>
                 <Activity size={12}/> Active
               </span>
            </div>
            <div className="relative">
               <span className="text-3xl font-mono font-bold text-[var(--t1)]">{latest.iceberg_iops.toLocaleString()}</span>
               <span className="text-[14px] text-[var(--t3)] ml-2">r/w sec</span>
            </div>
            <p className="text-[11px] text-[var(--t3)] mt-2 font-mono flex items-center gap-1">
               <ShieldAlert size={10} className="text-[var(--c-amber)]"/> Throttle Limit: 10,000
            </p>
         </div>

         <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-[#10b981]/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#10b981]/20 transition-all"></div>
            <div className="flex justify-between items-start mb-2 relative">
               <span className="text-[12px] font-semibold text-[var(--t3)] uppercase tracking-wider flex items-center gap-1.5"><Cpu size={14} className="text-[#10b981]"/> Spark Analytics RAM</span>
               <span className="text-[12px] text-[var(--t3)] flex items-center gap-1">
                 <Server size={12}/> 4 Nodes
               </span>
            </div>
            <div className="relative">
               <span className="text-3xl font-mono font-bold text-[var(--t1)]">{latest.spark_ram_gb.toFixed(1)}</span>
               <span className="text-[14px] text-[var(--t3)] ml-2">GB utilized</span>
            </div>
            <div className="mt-3 w-full bg-[var(--b2)] rounded-full h-1.5 overflow-hidden">
               <div className="bg-[#10b981] h-full" style={{width: `${(latest.spark_ram_gb / 256) * 100}%`}}></div>
            </div>
            <p className="text-[10px] text-[var(--t3)] mt-1.5 font-mono text-right">
               {((latest.spark_ram_gb / 256) * 100).toFixed(1)}% of 256GB limits
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {/* Multi-Metric Area Chart */}
         <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[var(--t1)] mb-6 flex items-center gap-2">
               <Activity size={16} className="text-[var(--c-blue)]" />
               System Load Distribution (24h)
            </h3>
            
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="var(--b2)" vertical={false} />
                     <XAxis 
                        dataKey="timestamp" 
                        stroke="var(--t3)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10} 
                     />
                     <YAxis 
                        yAxisId="left"
                        stroke="var(--t3)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        dx={-10}
                     />
                     <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="var(--t3)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        dx={10}
                     />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: 'var(--bg-card)', 
                           borderColor: 'var(--b2)',
                           borderRadius: '8px',
                           fontSize: '12px',
                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ fontFamily: 'monospace' }}
                        labelStyle={{ color: 'var(--t1)', fontWeight: 'bold', marginBottom: '4px' }}
                     />
                     <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px', color: 'var(--t2)' }}
                     />
                     <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="llm_latency_ms" 
                        name="LLM Latency (ms)"
                        stroke="#a855f7" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorLatency)" 
                     />
                     <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="spark_ram_gb" 
                        name="Spark Cluster RAM (GB)"
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRam)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
         
         {/* Secondary IOPS Chart */}
         <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-semibold text-[var(--t1)] mb-6 flex items-center gap-2">
               <Database size={16} className="text-[var(--c-blue)]" />
               Iceberg Lakehouse Throughput
            </h3>
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorIops" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="var(--b2)" vertical={false} />
                     <XAxis 
                        dataKey="timestamp" 
                        stroke="var(--t3)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10} 
                     />
                     <YAxis 
                        stroke="var(--t3)" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        dx={-10}
                     />
                     <Tooltip 
                        contentStyle={{ 
                           backgroundColor: 'var(--bg-card)', 
                           borderColor: 'var(--b2)',
                           borderRadius: '8px',
                           fontSize: '12px'
                        }}
                     />
                     <Area 
                        type="step" 
                        dataKey="iceberg_iops" 
                        name="Storage IOPS"
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorIops)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
