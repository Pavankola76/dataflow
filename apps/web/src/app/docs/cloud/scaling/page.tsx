"use client";
import React from "react";
import { Cpu, ChevronRight, Zap, ArrowDownToLine, SignalHigh } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>Cloud</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Scaling Infrastructure</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Cpu size={40} className="text-[#10b981]" />
         Scaling Infrastructure
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Intelligently configure auto-scaling triggers. When massive historical backfills are executed, DataFlow AI dynamically negotiates with your cloud provider to provision larger transient Spark clusters without manual intervention.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Dynamic Kubernetes Auto-Scaling</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Paying for idle, persistently powered-on compute instances is the leading fundamental cause of modern FinOps disasters. By default, DataFlow AI orchestrates all workloads across highly ephemeral Kubernetes pods utilizing Karpenter and native Cluster Autoscaler configurations.
      </p>

      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        This allows the architecture to scale from exactly absolute zero up to thousands of highly-parallelized cores precisely when your nightly Directed Acyclic Graphs (DAGs) are scheduled to execute, turning them back to zero the millisecond the pipeline finalizes.
      </p>

      {/* Alert Note */}
      <div className="bg-[#1e293b]/50 border-l-4 border-[#94a3b8] p-5 rounded-r-lg mb-12 max-w-3xl">
         <h4 className="text-white font-bold mb-2 flex items-center gap-2">
           <ArrowDownToLine size={18} className="text-[#cbd5e1]" />
           Zero-Scale Control Plane Minimums
         </h4>
         <p className="text-[#94a3b8] leading-relaxed">
            While execution data planes can descale to absolute zero, your centralized orchestrator (API Web Server & Redis Queue) requires a persistent, micro-sized node allocation (e.g. 1vCPU, 2GB RAM) running 24/7 to continuously monitor webhook ingestion triggers dynamically.
         </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Event-Driven Compute Horizons</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         If you normally process 1GB of incoming telemetry an hour, a tiny baseline 2-node cluster suffices easily. However, if a massive social media campaign suddenly spikes active traffic to 500GB/hr, a static infrastructure boundary would critically freeze and infinitely backlog.
      </p>

      {/* Clean Feature Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <SignalHigh size={20} className="text-[#3b82f6]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Prometheus Metric Integrations</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  DataFlow AI intimately integrates deeply with memory and CPU utilization telemetry metrics natively via Prometheus. It does not blindly watch the clock; it actively watches the memory consumption vector of your underlying nodes.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Zap size={20} className="text-[#f59e0b]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Automated Spot Execution</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Once an active pod's CPU allocation violently hits 80%, the Auto-Scaler instantly spins up matching Spot Instances on your public cloud tensor. As soon as the backlog queue successfully drains back to normal operating baselines, those secondary instances are destroyed cleanly, rapidly returning your overall cloud billing down to base minimums.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
