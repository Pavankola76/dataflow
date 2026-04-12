"use client";

import React from "react";
import { Bot, Sparkles, MessageSquare, RefreshCw } from "lucide-react";

export default function CopilotServiceDoc() {
  return (
    <div className="text-[#e2e8f0]">
      <h1 className="text-4xl font-extrabold text-white mb-6">AI Copilot & Auto-Healing</h1>
      <p className="text-xl text-[#94a3b8] mb-10 leading-relaxed border-b border-[#1e293b] pb-8">
        The DataFlow platform was architected from day one uniquely around intelligent AI agents. From code generation to dynamic self-healing, LLMs are deeply integrated into the data engineering lifecycle.
      </p>

      <div className="bg-[#1e293b] rounded-xl p-8 border border-[#3b82f6]/30 mb-12 shadow-lg flex flex-col items-center text-center">
         <Bot size={64} className="text-[#3b82f6] mb-6" />
         <h2 className="text-3xl font-bold text-white mb-4">The Natural Language Data OS</h2>
         <p className="text-[#94a3b8] text-lg max-w-2xl leading-relaxed">
            DataFlow AI fundamentally replaces manual boilerplate scripting. Instead of writing 400 lines of Airflow Python, you describe your business objective in plain English. The agent converts this intent into a deterministic, optimized data pipeline.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <MessageSquare size={32} className="text-[#10b981] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Text-to-SQL Analytics</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               The AI Copilot has full semantic understanding of your Data Catalog and Business Glossary. End-users can type <em>&quot;Show me revenue churn from last week by customer region&quot;</em>, and the agent synthesizes advanced analytical SQL dynamically, injecting the correct Star Schema JOINs automatically.
            </p>
         </div>
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Sparkles size={32} className="text-[#f59e0b] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Automated Data Modeling</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               Give the agent a raw (Bronze) data dump from a 3rd party API. It will automatically deduce the 3rd Normal Form standard, design fact and dimension tables, and write the dbt Core models required to structure it. No architecture diagrams needed.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
         <RefreshCw className="text-[#3b82f6]" /> Intelligent Auto-Healing 
      </h2>
      <p className="text-[#94a3b8] mb-6 leading-relaxed">
        Pipelines break. Columns rename, types shift from Integer to String, and APIs deprecate endpoints. Traditional orchestrators (like Airflow or Dagster) simply crash, throwing an unintelligible 500 Python stack trace in the middle of the night. 
      </p>

      <ul className="list-decimal pl-6 space-y-4 text-[#cbd5e1] mb-10">
         <li><strong>Anomaly Detection:</strong> A pipeline DAG node fails executing a Spark SQL step.</li>
         <li><strong>Context Gathering:</strong> The AI Agent intercepts the failure hook. It fetches the stack trace, the previous successful run logs, and the current schema snapshot from the metadata catalog.</li>
         <li><strong>Root Cause Analysis:</strong> The LLM identifies the root cause: <em>&quot;The upstream PostgreSQL source renamed &apos;client_id&apos; to &apos;customer_uuid&apos;&quot;.</em></li>
         <li><strong>Patch Generation:</strong> The agent automatically modifies the broken PySpark transform script, commits a patch to the git branch, and runs a dry-run test over the quarantined DAG node.</li>
         <li><strong>Human-In-The-Loop:</strong> The agent pauses the pipeline and issues an Approval Request via Slack: <em>&quot;Auto-Heal Patch Ready. Do you approve the change from client_id to customer_uuid?&quot;</em>. Upon approval, the data flow resumes immediately.</li>
      </ul>

      <div className="bg-[#1e293b] p-5 rounded-lg text-sm text-[#94a3b8]">
         <strong>Note:</strong> We fine-tune our enterprise reasoning models on millions of lines of open-source PySpark and dbt code, achieving near instantaneous deterministic outputs with zero hallucinations during the code generation phase.
      </div>
    </div>
  );
}
