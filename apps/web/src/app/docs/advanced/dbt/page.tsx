"use client";
import React from "react";
import { Database, ChevronRight, Terminal, Info } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation - AWS/Azure Style */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Advanced Topics</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Writing Custom dbt Models</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30 shadow-sm">
            <Database size={32} className="text-[#3b82f6]" />
         </span>
         Writing Custom dbt Models
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-8 leading-relaxed">
        Embed standard <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm text-mono">dbt Core</code> SQL directly into your visual canvas. The engine will seamlessly compile the <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm text-mono">ref()</code> lineage graph and execute it pushed-down natively into your target data warehouse.
      </p>

      {/* Azure/AWS Style Alert Box */}
      <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] p-4 rounded-r-lg mb-12 flex gap-3">
         <Info className="text-[#3b82f6] shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-white font-semibold text-sm mb-1">Note</h4>
            <p className="text-sm text-[#cbd5e1] leading-relaxed">
               Custom dbt models are executed exactly as written. They bypass the AI Auto-Healer mechanisms during execution. If an upstream schema drifts, the Copilot will flag a warning during compilation but will not auto-patch your manual SQL script.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#1e293b] pb-2">Extending Auto-Generated SQL</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
         <div>
            <p className="text-[#cbd5e1] leading-relaxed mb-4">
               While the AI Copilot provides over 95% of the boilerplate logic to build a standard dimensional model, Advanced Analytics teams inevitably encounter hyper-specific business logic scenarios that require manual intervention.
            </p>
            <ul className="space-y-3 text-[#94a3b8] text-sm">
               <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 shrink-0"></div> Custom fiscal-year padding and window functions</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 shrink-0"></div> Highly proprietary domain-specific matching algorithms</li>
               <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 shrink-0"></div> Overriding default materialized view clustering maps</li>
            </ul>
         </div>

         <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
            <div className="bg-[#1e293b]/50 px-4 py-2 border-b border-[#1e293b] flex items-center gap-2">
               <Terminal size={14} className="text-[#94a3b8]" />
               <span className="text-xs text-[#94a3b8] font-mono">models/gold/custom_fiscal_model.sql</span>
            </div>
            <div className="p-4 font-mono text-xs text-[#cbd5e1] whitespace-pre overflow-x-auto">
{`{{ config(materialized='table') }}

WITH base_orders AS (
  SELECT * FROM {{ ref('stg_orders') }}
)

SELECT 
  id,
  customer_id,
  -- Insert highly custom fiscal logic here manually
  calculate_custom_fiscal_quarter(order_date) AS fiscal_qtr
FROM base_orders
WHERE status != 'cancelled';`}
            </div>
         </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-4">The dbt Node Integration Pipeline</h3>
      <p className="text-[#cbd5e1] leading-relaxed mb-6">
         Within the Pipeline Canvas, dragging a pure "dbt Component" allows you to seamlessly mix AI nodes and completely manual overrides. Once injected, DataFlow AI natively renders this custom model back into its global Data Catalog and Lineage Graph, ensuring zero loss of observability.
      </p>

    </div>
  );
}
