"use client";
import React from "react";
import { Cloud, ChevronRight, Database, Network, Shield } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>Cloud</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Deploying to Azure</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Cloud size={40} className="text-[#3b82f6]" />
         Deploying to Azure
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Run DataFlow AI execution modules directly inside your Azure environment utilizing <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">Azure Data Lake Storage Gen2</code> and <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">Azure Synapse</code> natively without massive external data transfers.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Microsoft Azure Synergies</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Enterprise organizations leveraging the full Microsoft tenant ecosystem benefit substantially from isolated Azure execution deployments. Instead of exposing external API endpoints, your data orchestration plane is built securely within your internal subscription boundaries.
      </p>

      {/* Official Azure Style Important Note */}
      <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] p-5 rounded-r-lg mb-12 max-w-3xl">
         <h4 className="text-white font-bold mb-2 flex items-center gap-2">
           <Shield size={18} className="text-[#3b82f6]" />
           Azure Managed Identities
         </h4>
         <p className="text-[#cbd5e1] leading-relaxed">
            By utilizing native Azure Managed Identities, your data orchestrator accesses your Data Lake Gen2 storage blobs absolutely passwordlessly. No SAS tokens to rotate, and no connection strings to dangerously leak in source control repositories.
         </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Core Azure Connections</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         If your operational goal is tracking massive internal PowerBI semantic models or handling multi-terabyte analytical queries efficiently, DataFlow AI wraps completely around Azure's inherent architecture patterns perfectly without disruption.
      </p>

      {/* Clean Feature Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Database size={20} className="text-[#3b82f6]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Azure Data Lake Storage Gen2</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Acts identically as the hierarchical namespace file structure backing your entire Medallion Data pipeline. It is fully supported by our Python SDK connectors, storing raw Bronze records simultaneously as cleansed Gold analytical layers.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Network size={20} className="text-[#8b5cf6]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Azure Event Hubs API</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Functions natively as a drop-in Apache Kafka API wrapper. Connecting DataFlow AI to your Event Hubs instantly unlocks micro-second reliable CDC (Change Data Capture) streams from your connected Microsoft SQL Server and CosmosDB instances.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
