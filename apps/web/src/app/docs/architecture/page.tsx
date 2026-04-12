"use client";
import React from "react";
import { Layers, ChevronRight, CheckCircle2, History, ShieldAlert, Sparkles } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>Getting Started</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Medallion Architecture</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Layers size={40} className="text-[#3b82f6]" />
         Medallion Architecture
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        DataFlow AI natively constructs and fiercely enforces the logical Medallion Data Architecture. <code className="bg-[#cd7f32]/20 text-[#cd7f32] px-1.5 py-0.5 rounded text-sm font-bold">Bronze</code> exists exclusively for raw historical ingestion, <code className="bg-[#94a3b8]/20 text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-bold">Silver</code> for strictly-typed validated data, and <code className="bg-[#f59e0b]/20 text-[#f59e0b] px-1.5 py-0.5 rounded text-sm font-bold">Gold</code> for instantaneous BI aggregation metrics.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">The Three Pillars of Reliability</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Initially pioneered conceptually by Databricks, the structural Medallion Architecture pattern fundamentally organizes scattered data lakehouse storage into strictly progressing logical zones to absolutely guarantee computational reproducibility and quality.
      </p>

      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        Many external tools treat this architecture as merely an arbitrary guideline. DataFlow AI uniquely hard-codes this philosophical pattern directly into the core execution engine natively, eliminating the massive potential for recursive dependency failures.
      </p>

      {/* Structured Card Grid ONLY for the 3 distinct phases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         <div className="bg-[#111827] border-t-8 border-t-[#cd7f32] p-6 rounded shadow-lg border-x border-b border-[#1e293b]">
            <h3 className="text-xl font-bold text-white mb-3">Bronze Base</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-6">
               The completely unopinionated raw staging layer. Complex data objects arriving from Kafka CDC streams or periodic JSON API snapshots are uniformly dumped here persistently as strictly append-only, immutable Parquet files.
            </p>
            <ul className="text-sm text-[#cbd5e1] space-y-3">
               <li className="flex gap-2 items-start"><History size={16} className="text-[#cd7f32] mt-0.5 shrink-0"/> Absolutely infinite historical origin retention guarantees.</li>
               <li className="flex gap-2 items-start"><ShieldAlert size={16} className="text-[#cd7f32] mt-0.5 shrink-0"/> Zero destructive transformations permitted.</li>
            </ul>
         </div>

         <div className="bg-[#111827] border-t-8 border-t-[#94a3b8] p-6 rounded shadow-lg border-x border-b border-[#1e293b]">
            <h3 className="text-xl font-bold text-white mb-3">Silver Cleansed</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-6">
               The centralized foundation of organizational truth. At this intermediate mathematical layer, strict YAML Data Contracts eagerly activate to permanently drop null rows, aggressively resolve casting errors, and apply precise PII blurring natively.
            </p>
            <ul className="text-sm text-[#cbd5e1] space-y-3">
               <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-[#cbd5e1] mt-0.5 shrink-0"/> Perfectly filtered columnar datasets.</li>
               <li className="flex gap-2 items-start"><ShieldAlert size={16} className="text-[#cbd5e1] mt-0.5 shrink-0"/> Relentlessly enforces absolute Data Quality tests natively.</li>
            </ul>
         </div>

         <div className="bg-[#111827] border-t-8 border-t-[#f59e0b] p-6 rounded shadow-lg border-x border-b border-[#1e293b]">
            <h3 className="text-xl font-bold text-white mb-3">Gold Aggregation</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-6">
               Highly specific business-level star schemas perfectly tuned for immediate executive dashboarding usage continuously rendered inside platforms like external Tableau matrices, Microsoft Power BI, or our own native AI Copilot module.
            </p>
            <ul className="text-sm text-[#cbd5e1] space-y-3">
               <li className="flex gap-2 items-start"><Sparkles size={16} className="text-[#f59e0b] mt-0.5 shrink-0"/> Completely denormalized metrics.</li>
               <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-[#f59e0b] mt-0.5 shrink-0"/> Exceptional parallelized rapid read speeds.</li>
            </ul>
         </div>
      </div>

    </div>
  );
}
