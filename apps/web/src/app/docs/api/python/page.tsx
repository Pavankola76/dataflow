"use client";
import React from "react";
import { Terminal, ChevronRight, FileJson, Puzzle, Code2 } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#facc15] font-semibold mb-8 uppercase tracking-wider">
         <span>API Reference</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Python SDK Hooks</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Code2 size={40} className="text-[#facc15]" />
         Python SDK Hooks
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        The <code className="bg-[#1e293b] text-[#facc15] px-1.5 py-0.5 rounded text-sm font-mono">dataflow-sdk</code> pip package allows you to deeply integrate pipeline execution commands from existing Jupyter Notebooks or standard Airflow environments seamlessly.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Declarative Graph Registration</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Data Scientists building complex machine learning models directly inside Jupyter Notebooks frequently need to pull perfectly sanitized arrays from the Silver or Gold data layer without ever touching the frontend UI. 
      </p>
      
      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        The official <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">pip install dataflow-ai-sdk</code> library provides fully Pandas-compatible DataFrames dynamically requested across the internal network, ensuring algorithms train on the freshest available CDC states.
      </p>

      {/* Code Focus Box */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg max-w-4xl mb-12">
         <div className="bg-[#1e293b]/50 px-5 py-3 border-b border-[#1e293b] flex items-center gap-3">
            <FileJson size={16} className="text-[#facc15]" />
            <span className="text-sm text-white font-bold tracking-wide">Airflow Directed Acyclic Graphs (DAGs)</span>
         </div>
         <p className="px-5 pt-4 pb-2 text-[#94a3b8] leading-relaxed text-sm">
            If your organization strictly orchestrates everything—including non-data tasks—via Apache Airflow centrally, you can embed our managed Python operator natively to trigger downstream DataFlow executions.
         </p>
         <div className="p-5 font-mono text-xs text-[#cbd5e1] whitespace-pre overflow-x-auto bg-[#0a0c10] border-t border-[#1e293b]">
{`from airflow import DAG
from dataflow_ai.airflow import DataFlowOperator

trigger_silver_build = DataFlowOperator(
    task_id="build_silver_layer",
    pipeline_id="pl_abc123",
    wait_for_completion=True,
    fail_on_data_contract_breach=True
)`}
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Native Standard Output Hooking</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         When <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">wait_for_completion=True</code> is passed, this operator natively polls our background deployment cluster continuously. It seamlessly intercepts PySpark print log events, channeling them directly into your Airflow execution <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono">stdout</code> so your central DevOps monitoring never loses vital observability capabilities.
      </p>

    </div>
  );
}
