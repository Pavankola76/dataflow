"use client";
import React from "react";
import { Database, ChevronRight, Copy, ServerCrash, GitBranch, History } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Advanced Topics</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Backfilling Historical Data</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30 shadow-sm">
            <Database size={32} className="text-[#3b82f6]" />
         </span>
         Backfilling Historical Data
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-8 leading-relaxed">
        Instantly trigger parallelized backfills for massive specific data partitions (e.g. <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">2023-01-01</code> to <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">2024-01-01</code>) using the UI, completely isolated from disrupting live production streaming components.
      </p>

      {/* Azure/AWS Style Alert Box - Note */}
      <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] p-4 rounded-r-lg mb-10 flex gap-3">
         <ServerCrash className="text-[#3b82f6] shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-white font-semibold text-sm mb-1">Avoid Blind Reruns</h4>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
               When adding an entirely new logical transformation to an existing semantic model, recalculating historically spanning years is required. Triggering a raw execution "rerun" blindly across an entire 10-Terabyte dataset typically clogs centralized orchestration capacity globally and crashes the application layer.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#1e293b] pb-2">Asymmetric Processing Priorities</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <Copy className="text-[#10b981]" size={18} />
               Live-Stream Preservation
            </h4>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
               When deploying a backfill spanning 10,000,000 records originating from 2022, your active 2026 real-time Kafka transaction receiver cluster remains fully prioritized. 
               <br/><br/>
               DataFlow AI’s resource allocator guarantees current transactional latency never drops during heavy asynchronous historical compute loads.
            </p>
         </div>

         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <GitBranch className="text-[#8b5cf6]" size={18} />
               Automated Chunking
            </h4>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
               Rather than instructing Airflow to spawn a singular unstable Spark job, our orchestrator logically fractures the 2-year backfill request into highly discrete weekly windows. 
               <br/><br/>
               These micro-batches execute dynamically based on the available unutilized background compute capacity on your AWS/Azure tenant.
            </p>
         </div>

         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <History className="text-[#f59e0b]" size={18} />
               Atomic Delta Merging
            </h4>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               Once the historical transformations conclude successfully, the system does not delete the old table. It securely merges the resultant records logically into your target Bronze/Silver architecture via atomic <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">MERGE INTO</code> operations on Snowflake or Databricks. This guarantees absolute zero downtime to business BI end users viewing the layer.
            </p>
         </div>
      </div>

    </div>
  );
}
