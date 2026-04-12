"use client";
import React from "react";
import { BookOpen, ChevronRight, Wand2, Fingerprint, Activity } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>Getting Started</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Quickstart Guide</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <BookOpen size={40} className="text-[#3b82f6]" />
         Quickstart Guide
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Learn exactly how to orchestrate your very first data engineering pipeline architecture in minutes. Connect your mock database, formally define a target warehouse destination, and let DataFlow AI build the underlying Directed Acyclic Graph (DAG) autonomously.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Your First Pipeline in Dataflow AI</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Building your first end-to-end data pipeline completely bypasses hours of manual configuration by utilizing the Dataflow AI Natural Language Pipeline interface natively. 
      </p>

      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        Follow this highly straightforward flow below to instantly create a working ETL (Extract, Transform, Load) cluster asynchronously extracting from an imaginary application API directly into your managed cloud warehouse securely.
      </p>

      {/* Clean Step Listing */}
      <div className="space-y-10 mb-12 max-w-4xl">
         <div className="flex gap-5 items-start">
            <div className="mt-1 bg-[#1e293b] text-white p-3 rounded-full shrink-0 w-12 h-12 flex justify-center items-center font-bold shadow-lg border border-[#3b82f6]/30">1</div>
            <div>
               <h3 className="text-2xl font-bold text-white mb-3">Connect a Data Source</h3>
               <p className="text-[#94a3b8] leading-relaxed text-lg mb-4">
                  Navigate securely to the <strong>Connectors</strong> page. Select the standard "HTTP API" abstraction and enter a mock REST API URL (e.g., <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono tracking-wider">https://dummyjson.com/users</code>). 
               </p>
               <p className="text-[#94a3b8] leading-relaxed text-lg">
                  DataFlow AI will transparently proxy this connection to securely fetch the endpoint structure without aggressively importing the entire payload dataset remotely, saving massive network bandwidth during the initial tracking phase.
               </p>
            </div>
         </div>

         <div className="flex gap-5 items-start">
            <div className="mt-1 bg-[#1e293b] text-white p-3 rounded-full shrink-0 w-12 h-12 flex justify-center items-center font-bold shadow-lg border border-[#10b981]/30">2</div>
            <div>
               <h3 className="text-2xl font-bold text-white mb-3">Access the AI Prompt Canvas</h3>
               <p className="text-[#94a3b8] leading-relaxed text-lg mb-4">
                  Jump back intuitively to the main <strong>Pipeline Canvas</strong>. Instead of rigorously dragging and dropping 40 distinct architectural components manually, visually click the Copilot interactive icon and articulate your exact linguistic intention natively:
               </p>
               <div className="bg-[#0a0c10] border-l-4 border-[#10b981] p-5 rounded font-mono text-sm text-[#10b981] shadow-inner">
                  "Pull baseline tracking data from my dummy JSON REST API, absolutely drop the PII address columns securely, mathematically format birth dates to MM-DD-YYYY uniformly, and cleanly push the resulting aggregation matrix to Snowflake."
               </div>
            </div>
         </div>

         <div className="flex gap-5 items-start">
            <div className="mt-1 bg-[#1e293b] text-white p-3 rounded-full shrink-0 w-12 h-12 flex justify-center items-center font-bold shadow-lg border border-[#f59e0b]/30">3</div>
            <div>
               <h3 className="text-2xl font-bold text-white mb-3">Review & Deploy Compute Arrays</h3>
               <p className="text-[#94a3b8] leading-relaxed text-lg">
                  The integrated LLM Copilot will automatically intercept and interpret your linguistic parameters accurately, deterministically generating the underlying Python and PySpark architecture. Seamlessly verify the nodes visually, click <strong className="text-white">Run</strong>, and watch the ephemeral processing cluster securely parse the mathematical logs logically in real-time.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
