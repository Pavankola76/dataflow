"use client";

import React from "react";
import { Workflow, Layers, GitBranch, Terminal, AlertCircle } from "lucide-react";

export default function PipelinesServiceDoc() {
  return (
    <div className="text-[#e2e8f0]">
      <h1 className="text-4xl font-extrabold text-white mb-6">Pipelines Engine</h1>
      <p className="text-xl text-[#94a3b8] mb-10 leading-relaxed border-b border-[#1e293b] pb-8">
        The DataFlow AI Pipelines Engine orchestrates data movement and transformation across your entire architecture. It transparently unifies batch processing (via Apache Spark) and real-time streaming (via Apache Flink) into a single visual interface or code-first API.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Workflow size={32} className="text-[#3b82f6] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Visual DAG Builder</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               Construct Directed Acyclic Graphs (DAGs) using our infinite canvas. Drag and drop sources, transformations, ML scripts, and sinks. The engine automatically computes dependencies and resolves the execution order.
            </p>
         </div>
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Terminal size={32} className="text-[#10b981] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Prompt to Pipeline</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               Don&apos;t want to drag nodes? Just describe what you want. E.g., <em>&quot;Pull orders from Postgres, mask the phone number, join with Stripe payments, and sink to Snowflake.&quot;</em> The AI generates the Airflow/dbt codebase instantly.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Under the Hood</h2>
      
      <h3 className="text-xl font-bold text-[#e2e8f0] mt-8 mb-2">Intelligent Computing Engines</h3>
      <p className="text-[#94a3b8] mb-4 leading-relaxed">
        Unlike basic ELT tools, DataFlow AI dynamically routes computations based on latency requirements:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-[#cbd5e1] mb-8">
         <li><strong>Serverless PySpark (Micro-Batch):</strong> Designed for heavy, stateful transformations spanning TBs of historical data. Features dynamic auto-scaling per step.</li>
         <li><strong>Apache Flink (Continuous Stream):</strong> Ideal for Kafka CDC pipelines requiring sub-second latencies. Supports stateful aggregations (e.g., sliding window counts).</li>
         <li><strong>dbt Core (Pushdown SQL):</strong> If transforming inside a warehouse (Snowflake, BigQuery), the pipeline pushes standard SQL via dbt, avoiding massive network egress costs.</li>
      </ul>

      <div className="bg-[#1e293b] p-5 rounded-lg border-l-4 border-[#3b82f6] mb-10">
         <div className="flex items-center gap-2 mb-2 text-white font-semibold">
           <AlertCircle size={16} className="text-[#3b82f6]" /> Intelligent Auto-Healer
         </div>
         <p className="text-[#94a3b8] text-sm">
           If upstream columns drop or change names, traditional orchestrators fail. DataFlow AI&apos;s Auto-Healer intercepts the failure, reads the metadata diff, rewrites the transformation logic on the fly via AI, runs a dry-test, and resumes the pipeline with an alert sent to the Data Steward.
         </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Code Export & Versioning</h2>
      <p className="text-[#94a3b8] mb-6 leading-relaxed">
        We do not believe in vendor lock-in. Any pipeline built visually is compiled into standard, version-controlled Python (Apache Airflow/Prefect) and SQL (dbt). You can export your entire infrastructure as raw boilerplate at any time.
      </p>

    </div>
  );
}
