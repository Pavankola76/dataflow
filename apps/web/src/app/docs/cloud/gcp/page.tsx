"use client";
import React from "react";
import { Cloud, ChevronRight, Server, Database, Bot } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#ef4444] font-semibold mb-8 uppercase tracking-wider">
         <span>Cloud</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Deploying to GCP</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Cloud size={40} className="text-[#ef4444]" />
         Deploying to GCP
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Deploy DataFlow AI directly into Google Cloud Platform. Natively connect to <code className="bg-[#1e293b] text-[#ef4444] px-1.5 py-0.5 rounded text-sm font-mono">Google BigQuery</code> and <code className="bg-[#1e293b] text-[#ef4444] px-1.5 py-0.5 rounded text-sm font-mono">Cloud Storage</code> to execute massive analytical processing while completely eliminating external data egress costs.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Google Cloud Integration Path</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Deploying to Google Cloud Platform (GCP) provides exceptional analytical advantages thanks to GCP's deeply interconnected, managed data ecosystem. When you deploy the DataFlow AI worker nodes into your GCP Identity Projects, you unlock instantaneous, highly-parallel batch write speeds directly into your data warehouse.
      </p>
      
      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        GCP’s global VPC network dramatically accelerates geographically distributed pipeline topologies, allowing DataFlow AI to transparently shift massive datasets between regions without requiring complex manual networking gateways.
      </p>

      {/* Official GCP Style Important Note Box */}
      <div className="bg-[#10b981]/10 border-l-4 border-[#10b981] p-5 rounded-r-lg mb-12 max-w-3xl">
         <h4 className="text-white font-bold mb-2 flex items-center gap-2">
           <Database size={18} className="text-[#10b981]" />
           Service Account Workload Federations
         </h4>
         <p className="text-[#cbd5e1] leading-relaxed">
            DataFlow AI authenticates strictly through Google Cloud Workload Identity Federation rather than requesting static JSON Service Account keys. This entirely eliminates the risk of long-lived key compromise during the ingestion tracking phase.
         </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">GCP Resource Provisioning Model</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         GCP offers profound architectural capabilities by unifying storage, analytics, and machine learning into a single permission boundary securely.
      </p>

      {/* Clean Feature Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Server size={20} className="text-[#ef4444]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Cloud Storage & BigQuery</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  DataFlow AI targets standard Google Cloud Storage buckets safely as your Bronze staging zones before pushing heavily refined schemas downstream. It intelligently utilizes the BigQuery Storage Write API endpoints natively, unlocking multi-million row analytics insertions per second.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Bot size={20} className="text-[#3b82f6]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Vertex AI Model Calling</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  When your data pipelines require complex Unstructured Data Parsing (such as Optical Character Recognition on PDF invoices, or Sentiment Analysis indexing), DataFlow AI securely scopes IAM permissions to call your strictly local Vertex AI Gemini endpoints to keep all automated reasoning completely private.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
