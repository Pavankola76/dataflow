"use client";
import React from "react";
import { Terminal, ChevronRight, Activity, Webhook, Zap } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#10b981] font-semibold mb-8 uppercase tracking-wider">
         <span>API Reference</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">REST API Reference</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Terminal size={40} className="text-[#10b981]" />
         REST API Reference
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Trigger pipeline DAGs sequentially, register sophisticated new data contracts, and query monitoring metrics programmatically using standard HTTP JSON workflows.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Asynchronous Trigger Patterns</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Sometimes massive Data Pipelines should not be scheduled sequentially by a rigid Cron clock, but triggered flexibly by an external downstream event. 
      </p>
      
      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        For instance, when a third-party analytics vendor finishes securely uploading a batched CSV to your external SFTP server, their connected system can aggressively fire a webhook to the DataFlow REST API to instantly trigger the ingestion DAG without waiting for the nightly processing window.
      </p>

      {/* Code Focus Box */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg max-w-4xl mb-12">
         <div className="bg-[#1e293b]/50 px-5 py-3 border-b border-[#1e293b] flex items-center gap-3">
            <Webhook size={16} className="text-[#10b981]" />
            <span className="text-sm text-white font-bold tracking-wide">Webhook Ingestion Trigger</span>
         </div>
         <p className="px-5 pt-4 pb-2 text-[#94a3b8] leading-relaxed text-sm">
            You must authenticate securely using a heavily restricted ephemeral Bearer token provisioned via the Service Accounts UI. Never embed root API keys into webhook configurations.
         </p>
         <div className="p-5 font-mono text-sm text-[#cbd5e1] whitespace-pre overflow-x-auto bg-[#0a0c10] border-t border-[#1e293b]">
            <span className="text-[#f59e0b] font-bold">POST</span> https://api.dataflow.ai/v1/workspaces/ws_abc123/pipelines/pl_xyz789/trigger
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Inspecting Execution States</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         The POST trigger endpoint strictly returns an immediate <code className="bg-[#1e293b] text-[#10b981] px-1.5 py-0.2 rounded font-mono">HTTP 202 Accepted</code> header, dispensing a highly unique <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">run_id</code> token payload rather than keeping the remote connection open.
      </p>
      
      <div className="flex items-start gap-4 max-w-4xl">
         <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
            <Zap size={20} className="text-[#3b82f6]" />
         </div>
         <div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Polling Architecture</h3>
            <p className="text-[#94a3b8] leading-relaxed">
               You can subsequently query the <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono text-xs">/v1/runs/&#123;run_id&#125;</code> endpoint dynamically in a customized polling loop to inspect the resultant PySpark cluster deployment status and row insertions in real-time.
            </p>
         </div>
      </div>

    </div>
  );
}
