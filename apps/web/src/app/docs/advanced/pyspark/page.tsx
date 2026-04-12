"use client";
import React from "react";
import { Zap, ChevronRight, AlertTriangle, Layers, Cpu } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Advanced Topics</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">PySpark Performance Tuning</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30 shadow-sm">
            <Zap size={32} className="text-[#3b82f6]" />
         </span>
         PySpark Performance Tuning
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-8 leading-relaxed">
        Advanced techniques for optimizing large stateful joins. Prevent memory spillage by forcing <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm text-mono">Broadcast Hash Joins</code> intelligently using AI hints in your pipeline canvas.
      </p>

      {/* Azure/AWS Style Alert Box - Warning */}
      <div className="bg-[#f59e0b]/10 border-l-4 border-[#f59e0b] p-4 rounded-r-lg mb-12 flex gap-3">
         <AlertTriangle className="text-[#f59e0b] shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-white font-semibold text-sm mb-1">Important: Out Of Memory (OOM) Errors</h4>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
               Improperly tuned joins will trigger unrecoverable OOM faults on executor nodes. Before applying manual overrides, ensure you have reviewed the automated Shuffle telemetry available inside the Data Observability dashboard.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#1e293b] pb-2">Mitigating Shuffle Overheads</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed">
         The most expensive mathematical operation in any distributed computing framework is the Network Shuffle—the process of redistributing data amongst different nodes prior to a complex aggregation or join. DataFlow AI automates most tuning, but provides strict manual controls when required.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
               <Layers className="text-[#10b981]" size={18} />
               Broadcast Variables
            </h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
               When joining a massive 5-Terabyte transaction table strictly against a tiny 5MB Country Dimension mapping, you must instruct the cluster not to shuffle. 
               <br/><br/>
               DataFlow AI allows you to attach a <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.2 rounded font-mono">Broadcast()</code> hint directly onto the visual node. The 5MB table is natively duplicated to all active workers, keeping the TB table flowing linearly in parallel.
            </p>
         </div>

         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
               <Cpu className="text-[#8b5cf6]" size={18} />
               Dynamic Salting
            </h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               If your aggregation is grouped by UserID, and 80% of your records belong to a single "Guest" account, the default hash partitioner assigns all 80% to a single CPU thread, killing it. 
               <br/><br/>
               Our system provides automated query-injection techniques that append randomized salt hashes to the key, forcing balanced mathematical re-distribution before the grouping phase.
            </p>
         </div>
      </div>

    </div>
  );
}
