"use client";
import React from "react";
import { Shield, ChevronRight, Bot, Target, Network } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Advanced Topics</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Custom Great Expectations</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30 shadow-sm">
            <Shield size={32} className="text-[#3b82f6]" />
         </span>
         Custom Great Expectations
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-8 leading-relaxed">
        While the platform provides powerful built-in PII and basic analytics masking, you can inject standard <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">Great Expectations (GX)</code> Python architectures directly into the centralized pipeline hook architecture.
      </p>

      {/* Azure/AWS Style Alert Box - Info */}
      <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] p-4 rounded-r-lg mb-10 flex gap-3">
         <Bot className="text-[#3b82f6] shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-white font-semibold text-sm mb-1">Integrating Remote Contexts</h4>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
               If your organization already possesses an established Great Expectations deployment mapping directory, simply authorize the API context through our environment variables page. DataFlow AI will immediately begin indexing your pre-existing rulesets.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#1e293b] pb-2">Pythonic Quality Validation</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed">
         Our proprietary Data Contracts AI executes the vast majority of standardized tests instantly (e.g. <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono">is_not_null</code>, <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono">is_unique</code>, <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono">is_email_format</code>). However, massive financial institutions and nuanced healthcare organizations often maintain hundreds of thousands of lines of deeply complex legacy Python code written strictly for the Great Expectations platform. DataFlow AI securely imports these constraints as a natively unified testing module.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <Target className="text-[#10b981]" size={18} />
               Asynchronous Evaluation
            </h4>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
               Any Pipeline Node transitioning downstream from the raw Bronze layer to the validated Silver layer triggers a seamless asynchronous hook. 
               <br/><br/>
               This hook securely parses and evaluates against the remote <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">Great Expectations Dataset Dictionary</code> without pausing the primary ingestion stream, maximizing cluster utilization.
            </p>
         </div>

         <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
               <Network className="text-[#8b5cf6]" size={18} />
               Native Parallel Execution
            </h4>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               Advanced GX expectations containing dense mathematical conditional parameters (such as <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono break-all line-clamp-1">expect_column_bootstrapped_median_to_be_between</code>) run simultaneously distributed across your auto-scaled Apache Spark worker nodes natively.
               <br/><br/>
               Additionally, all resultant GX validation graphs map identically back into DataFlow's central Data Catalog dashboard.
            </p>
         </div>
      </div>

    </div>
  );
}
