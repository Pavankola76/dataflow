"use client";
import React from "react";
import { Terminal, ChevronRight, Layers, FileCode2 } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>API Reference</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">TypeScript Client</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <FileCode2 size={40} className="text-[#3b82f6]" />
         TypeScript Client
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Standardized documentation covering the <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">@dataflow-ai/react</code> npm module. This framework is absolutely perfect for deeply injecting our native Copilot analytics tools into your own internal business react applications seamlessly.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Embedded Analytics Dashboards</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Your engineers might be developing custom internal administrative dashboards utilizing Next.js, Remix, or vanilla React.js interfaces. 
      </p>

      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
         By dynamically calling the DataFlow AI TypeScript parser inside your frontend UI component tree directly, you can completely bypass the painful necessity of configuring structurally distinct BI tools like Tableau or Looker.
      </p>

      {/* Code Focus Box */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg max-w-4xl mb-12">
         <div className="bg-[#1e293b]/50 px-5 py-3 border-b border-[#1e293b] flex items-center gap-3">
            <Layers size={16} className="text-[#3b82f6]" />
            <span className="text-sm text-white font-bold tracking-wide">AI Copilot Node Context React Hook</span>
         </div>
         <p className="px-5 pt-4 pb-2 text-[#94a3b8] leading-relaxed text-sm">
            The structurally simplest way to integrate our advanced Text-to-SQL logic natively inside your app is utilizing our optimized pre-built React Context hook framework. It connects securely backend-to-backend so delicate API keys aren't exposed to the client browser.
         </p>
         <div className="p-5 font-mono text-xs text-[#cbd5e1] whitespace-pre overflow-x-auto bg-[#0a0c10] border-t border-[#1e293b]">
{`import { useDataCopilot } from "@dataflow-ai/react";

const RevenueChart = () => {
   const { data, loading, askQuery } = useDataCopilot();

   // Query is mathematically translated to Snowflake SQL automatically
   // Returning structured JSON D3.js compatible arrays directly inline
   return (
       <div className="p-4 bg-white rounded shadow">
           <button 
             onClick={() => askQuery("Chart Monthly Revenue by Product Type")}
             className="px-4 py-2 bg-blue-600 text-white rounded"
           >
             Generate Executive Data Array
           </button>
           
           {!loading && data && <BarChart data={data} />}
       </div>
   );
}`}
         </div>
      </div>

    </div>
  );
}
