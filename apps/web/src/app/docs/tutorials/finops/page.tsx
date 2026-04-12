"use client";
import React from "react";
import { BarChart3, ChevronRight, DollarSign } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0]">
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Tutorials</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">FinOps Cost Optimization</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30">
            <BarChart3 size={32} className="text-[#3b82f6]" />
         </span>
         FinOps Cost Optimization
      </h1>
      <p className="text-xl text-[#94a3b8] mb-10 leading-relaxed border-b border-[#1e293b] pb-8">
        Learn how to use our Observability module to track exactly how much each Snowflake query or Spark shuffle is costing you, and how to optimize them automatically.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Engineering for Value</h2>
      <p className="text-[#cbd5e1] mb-6 leading-relaxed">
        It is remarkably easy to accidentally spend $50,000 merging tables erroneously. Data Engineers must balance latency speed against execution cost mathematically. Implementing FinOps (Financial Operations) practices directly into pipeline development is paramount.
      </p>

      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-lg mb-8">
         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><DollarSign size={18} className="text-[#22c55e]" /> Observability & Lineage Tracking</h3>
         <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">
            Under your pipeline&apos;s Observability tab, you should regularly analyze the mathematical node-expense breakdown graph. In this tutorial, we will refactor a badly-made pipeline:
         </p>
         <ul className="list-disc pl-5 space-y-3 text-sm text-[#cbd5e1]">
            <li><strong>Identifying the Bottleneck:</strong> We&apos;ll spot a `JOIN` node taking 2.5 hours and burning excessive Karpenter auto-scaling credits due to full-table scans.</li>
            <li><strong>AI Intelligent Refactoring:</strong> By clicking &quot;Optimize FinOps&quot;, the AI Copilot will recognize that the joined columns lack Z-Ordering and Partition maps in the destination destination Lakehouse.</li>
            <li><strong>Implementing Clusters:</strong> We&apos;ll accept the AI suggestion, transparently rewriting the Spark output phase to `PARTITION BY (year, month)` and `CLUSTER BY (user_id)`, radically dropping the subsequent join time to under 4 minutes.</li>
         </ul>
      </div>
    </div>
  );
}
