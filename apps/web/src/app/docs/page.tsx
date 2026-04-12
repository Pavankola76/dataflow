"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Book, Shield, Zap, Workflow } from "lucide-react";

export default function DocsIntroduction() {
  return (
    <div className="text-[#e2e8f0]">
      <h1 className="text-4xl font-extrabold text-white mb-6">Welcome to DataFlow AI</h1>
      <p className="text-xl text-[#94a3b8] mb-8 leading-relaxed">
        DataFlow AI is the world&apos;s first unified, AI-native autonomous data engineering platform. Built for modern data teams, it automates the creation, scaling, and maintenance of both batch and real-time streaming pipelines.
      </p>

      <div className="bg-[#1e293b] rounded-xl p-6 border border-[#3b82f6]/30 mb-10 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={120} /></div>
         <h2 className="text-2xl font-bold text-white mb-3">Why DataFlow AI?</h2>
         <p className="text-[#cbd5e1] leading-relaxed relative z-10">
            Traditionally, building an enterprise data warehouse required connecting disparate tools: Airbyte for ingestion, dbt for transformation, Airflow for orchestration, and Monte Carlo for observability. DataFlow AI consolidates these into a single control plane, enhanced by autonomous agents that self-heal broken schemas and generate SQL on the fly.
         </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-12">Core Concepts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link href="/docs/services/pipelines" className="group p-5 bg-[#111827] border border-[#1e293b] rounded-xl hover:bg-[#1e293b] hover:border-[#3b82f6]/50 transition-all">
          <Workflow className="text-[#3b82f6] mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">Automated Pipelines</h3>
          <p className="text-[#94a3b8] text-sm">Design complex DAGs mathematically via the visual canvas or use our AI prompt builder to generate PySpark clusters automatically.</p>
        </Link>
        <Link href="/docs/services/catalog" className="group p-5 bg-[#111827] border border-[#1e293b] rounded-xl hover:bg-[#1e293b] hover:border-[#10b981]/50 transition-all">
          <Book className="text-[#10b981] mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">Active Governance</h3>
          <p className="text-[#94a3b8] text-sm">Define Data Contracts on your Medallion layers. Our AI agent actively monitors for SLA breaches and PII leaks.</p>
        </Link>
        <Link href="/docs/services/observability" className="group p-5 bg-[#111827] border border-[#1e293b] rounded-xl hover:bg-[#1e293b] hover:border-[#8b5cf6]/50 transition-all">
          <Shield className="text-[#8b5cf6] mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-bold text-white mb-2">Observability</h3>
          <p className="text-[#94a3b8] text-sm">Drill down into column-level lineage and interactive monitoring charts measuring everything from Kafka lag to LLM trace latency.</p>
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">The Medallion Architecture Engine</h2>
      <p className="text-[#94a3b8] mb-6 leading-relaxed">
        We strongly enforce Databricks' Medallion Architecture pattern for logical data organization. This pattern logically breaks data into Bronze, Silver, and Gold layers:
      </p>
      <ul className="space-y-4 mb-10 text-[#cbd5e1]">
         <li className="flex items-start gap-3 bg-[#111827] p-4 rounded-lg border border-[#1e293b]">
            <div className="mt-1 flex-shrink-0 w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <div><strong className="text-white">Bronze (Raw):</strong> Direct replicas of source systems (Postgres CDC, APIs) containing raw, unvalidated history in an immutable append-only state.</div>
         </li>
         <li className="flex items-start gap-3 bg-[#111827] p-4 rounded-lg border border-[#1e293b]">
            <div className="mt-1 flex-shrink-0 w-3 h-3 rounded-full bg-[#94a3b8]"></div>
            <div><strong className="text-white">Silver (Cleansed):</strong> Filtered, cleaned, and augmented data. Here, schemas are strictly typed and Data Contracts enforce column uniqueness and bounds.</div>
         </li>
         <li className="flex items-start gap-3 bg-[#111827] p-4 rounded-lg border border-[#1e293b]">
            <div className="mt-1 flex-shrink-0 w-3 h-3 rounded-full bg-[#eab308]"></div>
            <div><strong className="text-white">Gold (Business / Marts):</strong> Highly refined, star-schema aggregated data optimized directly for BI dashboards and reverse-ETL triggers.</div>
         </li>
      </ul>

      <div className="flex items-center gap-4 mt-12 bg-[#3b82f6]/10 border border-[#3b82f6]/20 p-6 rounded-xl">
         <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Ready to jump in?</h3>
            <p className="text-[#94a3b8]">Follow our comprehensive example to build your first real-time analytics engine.</p>
         </div>
         <Link href="/docs/tutorials/ecommerce" className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded font-medium transition-colors">
            Start the Tutorial <ArrowRight size={16} />
         </Link>
      </div>
    </div>
  );
}
