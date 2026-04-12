"use client";
import React from "react";
import { Check, ChevronRight, Shield, AlertTriangle, XOctagon } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Advanced Topics</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Data Contracts Strictness</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30 shadow-sm">
            <Check size={32} className="text-[#3b82f6]" />
         </span>
         Data Contracts Strictness
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-8 leading-relaxed">
        Implement rigorous <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">WARN</code> or <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">BLOCK</code> constraint modes on specific target tables horizontally. Ensure mission-critical columns like <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono">user_email</code> are strictly formatted and never transit as null values.
      </p>

      {/* Azure/AWS Style Alert Box - Shield */}
      <div className="bg-[#10b981]/10 border-l-4 border-[#10b981] p-4 rounded-r-lg mb-10 flex gap-3">
         <Shield className="text-[#10b981] shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-white font-semibold text-sm mb-1">Enforcing Quality Topologies</h4>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
               Data Engineering fundamentally breaks down when pipelines process thousands of garbage rows anonymously. The explicit declaration of structural "Data Contracts" computationally shifts data reliability ownership upstream directly onto application production teams.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#1e293b] pb-2">The Execution Gates</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed">
         You establish Data Contracts visually via the Data Catalog. These YAML configurations dictate the absolute execution tolerances for downstream ingestions:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <AlertTriangle className="text-[#f59e0b]" size={18} />
               WARN Mode
            </h4>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
               If structural anomalies occur (e.g. tracking scripts fail and 10% of newly emitted signups lack a region code), the records are historically processed and ingested natively into your Silver tables. 
               <br/><br/>
               However, the orchestrator triggers an immediate webhook to Slack or Microsoft Teams alerting the primary stakeholder about the statistical quality degradation occurring behind the scenes.
            </p>
         </div>

         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#ef4444]">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <XOctagon className="text-[#ef4444]" size={18} />
               BLOCK Mode
            </h4>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               For critical financial compliance factors (e.g. enforcing valid taxonomy fields during Stripe ingestion), any rows failing the absolute identical validation tests are entirely severed from the main Bronze flow. 
               <br/><br/>
               They are partitioned mathematically into a separate <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">Dead-Letter Queue</code> persistence table awaiting engineering manual forensics, preserving the purity of the destination lakehouse.
            </p>
         </div>
      </div>

    </div>
  );
}
