"use client";
import React from "react";
import { Settings, ChevronRight, DollarSign, Activity, PowerOff } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#10b981] font-semibold mb-8 uppercase tracking-wider">
         <span>Config</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Billing & Subscriptions</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <DollarSign size={40} className="text-[#10b981]" />
         Billing & Subscriptions
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Manage your exact infrastructure usage constraints seamlessly. DataFlow AI fundamentally charges based entirely on transparent active compute seconds utilized actively by the PySpark pipeline engine natively, eliminating hidden ingestion tier taxes completely.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Transparent Consumption Logic</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         We strictly believe in pure utility-based mathematical pricing models designed closely for extreme data engineering elasticity. 
      </p>

      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
         Unlike legacy platforms configuring charges fundamentally via aggregate "Row Count" mechanisms—which critically penalizes engineering teams iterating historically massive aggregation tables completely—we natively charge exclusively by Active Compute Core Hours allocated successfully in the background.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6 mt-8">Establishing Hard Budget Caps</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         Inside your Billing Configuration settings portal natively, you must actively establish secure Monthly Cost Threshold constraints dynamically to mathematically prevent disastrous scaling bill shocks computationally.
      </p>

      {/* Clean Feature Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Activity size={20} className="text-[#f59e0b]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Soft Tracking Limits</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Establish initial warning threshold markers (e.g., $1,000/mo mathematically) that dynamically trigger automated critical warning notification emails directly to organizational Administrators, while firmly maintaining global cluster processing service uptime completely unhindered.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <PowerOff size={20} className="text-[#ef4444]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Absolute Hard Limit Thresholds</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Design robust absolute failure kill-switches strictly (e.g., $3,000/mo ceiling limit). If an internal engineer critically writes a highly volatile looping recursive DAG natively, rapidly inflating compute usage dangerously, reaching your Hard Cap forces the core orchestrator infrastructure to gracefully drop pipeline executions entirely. This definitively computationally enforces absolute financial constraints successfully.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
