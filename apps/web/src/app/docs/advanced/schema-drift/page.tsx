"use client";
import React from "react";
import { AlignLeft, ChevronRight, AlertTriangle, Info, GitMerge, FileX } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Advanced Topics</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Handling Schema Drift</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30 shadow-sm">
            <AlignLeft size={32} className="text-[#3b82f6]" />
         </span>
         Handling Schema Drift
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-8 leading-relaxed">
        When upstream product teams change the structure of a raw API, DataFlow AI quarantines the downstream execution immediately and suggests an automated backward-compatible healing logic patch via the Copilot.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#1e293b] pb-2">The Schema Registry AI Monitor</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed">
         Schema drift is the silent killer of all centralized data warehouses. Traditionally, when a backend engineer modifies an API endpoint (e.g. changing <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">subscription_price: Integer</code> to <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">subscription_price: Float</code>), the downstream nightly ETL job violently crashes attempting a type conversion. DataFlow AI acts as a native buffer against these faults.
      </p>

      {/* Azure/AWS Style Alert Box - Info */}
      <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] p-4 rounded-r-lg mb-10 flex gap-3">
         <Info className="text-[#3b82f6] shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-white font-semibold text-sm mb-1">Native Registry Integrations</h4>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
               DataFlow AI integrates securely with Confluent Schema Registry (Avro/Protobuf) out of the box. The engine actively monitors registry version bumps and evaluates permutations mathematically before execution begins.
            </p>
         </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-6 mt-8">Soft vs Hard Evolutions</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <GitMerge className="text-[#10b981]" size={18} />
               Additive Soft Drift
            </h4>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
               If an upstream API starts transmitting an entirely new property parameter, the logic layer evaluates it as harmless. 
               <br/><br/>
               The field is autonomously appended to the <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">Silver Dataset</code> in Delta Lake dynamically, requiring exactly zero human interventions or pipeline redeployments.
            </p>
         </div>

         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#ef4444]">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <FileX className="text-[#ef4444]" size={18} />
               Destructive Hard Drift
            </h4>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               If an existing active column used in complex JOIN logic is unilaterally deleted upstream, DataFlow AI triggers a Hard Quarantine. 
               <br/><br/>
               The Copilot LLM reads the pipeline dependencies and offers an immediate fallback patch—such as injecting an intelligent <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">COALESCE</code> with historical mean values—until your team confirms the structural change.
            </p>
         </div>
      </div>

    </div>
  );
}
