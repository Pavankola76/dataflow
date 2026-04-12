"use client";

import React from "react";
import { BarChart3, Clock, DollarSign, Activity } from "lucide-react";

export default function ObservabilityServiceDoc() {
  return (
    <div className="text-[#e2e8f0]">
      <h1 className="text-4xl font-extrabold text-white mb-6">Data Observability</h1>
      <p className="text-xl text-[#94a3b8] mb-10 leading-relaxed border-b border-[#1e293b] pb-8">
        Full-stack visibility into your data workflows. The Observability component acts as an MRI scanner for your infrastructure, tracking pipeline latencies, compute performance, query costs, and data health in real-time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Clock size={28} className="text-[#3b82f6] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">SLA & Freshness Monitoring</h3>
            <p className="text-[#94a3b8] text-sm">Measure how often essential metrics are updated. Set strict SLA thresholds (e.g., <em>&quot;Gold Revenue Table must refresh by 9am EST&quot;</em>) and track delivery probability models.</p>
         </div>
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Activity size={28} className="text-[#8b5cf6] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Infrastructure Telemetry</h3>
            <p className="text-[#94a3b8] text-sm">Stream granular metrics regarding your underlying compute clusters (Spark memory utilization, Flink checkpointing duration, and Kafka consumer lag).</p>
         </div>
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <DollarSign size={28} className="text-[#10b981] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">FinOps Cost Optimitazion</h3>
            <p className="text-[#94a3b8] text-sm">Track actual dollar spend down to the specific user query or pipeline node scale-out event. AI agents flag unused intermediate tables and overly expensive full-scans.</p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Pipeline Health & Alerts</h2>
      <p className="text-[#94a3b8] mb-6 leading-relaxed">
        Observability integrates natively with the Data Contracts engine. If thousands of blank customer records suddenly stream in during a Black Friday event, the engine will halt the specific partition flow, quarantine the anomalies, and trigger severity 1 PagerDuty alarms while permitting healthy pipelines around it to continue.
      </p>

      <h2 className="text-2xl font-bold text-white mt-12 mb-4">Automated Performance Tuning</h2>
      <p className="text-[#94a3b8] mb-6 leading-relaxed">
        The Observability suite doesn&apos;t just display colorful graphs — it actively optimizes the system.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-[#cbd5e1] mb-10">
         <li><strong>Spark Shuffle Optimization:</strong> If the agent detects excessive data spill during complex joins, it will preemptively rewrite the cluster configuration to assign higher memory nodes before the next DAG run.</li>
         <li><strong>Index Suggestions:</strong> If `dim_users` is constantly queried via full scans across Snowflake, the AI suggests optimal clustering push-downs.</li>
      </ul>
    </div>
  );
}
