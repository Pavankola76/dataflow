"use client";

import React, { useState, useEffect } from "react";
import { Code2, Plus, Globe, Key, Clock, Zap, Target, Loader2, ArrowRight, ShieldCheck, Database, Link2, Copy, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/stores";

interface EmbedConnection {
  id: string;
  target_dashboard: string;
  token_prefix: string;
  allowed_domains: string[];
  monthly_requests: number;
  status: string;
  created_at: string;
}

export default function SDKPage() {
  const [embeds, setEmbeds] = useState<EmbedConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchEmbeds = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/sdk/embeds", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setEmbeds(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch sdk embeds", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmbeds();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page-content animate-in h-screen overflow-y-auto">
      <div className="page-header shrink-0 mb-8 border-b border-[var(--b2)] pb-4 block">
        <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Code2 size={20} className="text-[var(--c-amber)]" />
                Embeddable Analytics SDK
              </h1>
              <p className="page-subtitle">Generate secure tokens to embed interactive DataFlow AI visualizations into your external products.</p>
            </div>
            <div className="page-header-actions">
               <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
                 <Link2 size={14} className="text-[var(--t3)]" /> Webhook Integrations
               </button>
               <button className="bg-[var(--c-amber)] hover:bg-yellow-500 text-black border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
                 <Plus size={14} /> New API Key
               </button>
            </div>
        </div>
      </div>

      {/* Code Snippet Demo */}
      <div className="mb-8 bg-[#0d1015] border border-[var(--b2)] rounded-xl overflow-hidden shadow-sm">
         <div className="border-b border-[var(--b2)] bg-[#15171b] px-4 py-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-red-500"></span>
               <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
               <span className="w-3 h-3 rounded-full bg-green-500"></span>
               <span className="ml-2 text-[12px] font-mono text-[var(--t3)]">integrate.tsx</span>
            </div>
            <button className="text-[12px] text-[var(--t3)] hover:text-[var(--t1)] flex items-center gap-1.5 transition-colors">
              <Copy size={12} /> Copy React Example
            </button>
         </div>
         <div className="p-4">
           <pre className="text-[13px] font-mono leading-relaxed">
             <span className="text-pink-400">import</span> {'{ DataFlowEmbed }'} <span className="text-pink-400">from</span> <span className="text-[var(--c-green)]">'@dataflow-ai/react'</span>;{'\n\n'}
             <span className="text-pink-400">export default function</span> <span className="text-[var(--c-blue)]">ExternalDashboard</span>() {'{\n'}
             {'  '} <span className="text-pink-400">return</span> (\n
             {'    '} &lt;<span className="text-[var(--c-blue)]">DataFlowEmbed</span>{'\n'}
             {'      '} <span className="text-[var(--c-amber)]">dashboardId</span>=<span className="text-[var(--c-green)]">"emb_salesforce_hq"</span>{'\n'}
             {'      '} <span className="text-[var(--c-amber)]">token</span>=<span className="text-[var(--c-green)]">"df_live_8f92..."</span>{'\n'}
             {'    '} /&gt;\n
             {'  '});{'\n'}
             {'}'}
           </pre>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {embeds.map((emb) => (
          <div key={emb.id} className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl shadow-sm hover:border-[var(--c-amber)]/50 transition-colors flex flex-col overflow-hidden relative">
             <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex gap-4 items-center">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner bg-[var(--c-amber-bg)] border border-[var(--c-amber)]/30 text-[var(--c-amber)]">
                       <BarChart3 size={24} />
                     </div>
                     <div>
                       <h2 className="text-[16px] font-semibold text-[var(--t1)] leading-tight flex items-center gap-2">
                         {emb.target_dashboard}
                         <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border bg-[var(--c-green-bg)] text-[var(--c-green)] border-[var(--c-green)]/30">
                           {emb.status}
                         </span>
                       </h2>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[var(--t3)] font-mono">{emb.id}</span>
                       </div>
                     </div>
                   </div>
                </div>

                <div className="bg-[#0a0c10] border border-[var(--b2)] rounded-lg py-3 px-4 mb-5 flex justify-between items-center group">
                   <div>
                     <span className="flex items-center gap-1.5 text-[10px] text-[var(--t3)] uppercase font-semibold mb-1">
                       <Key size={12} className="text-[var(--t2)]" /> API Token Key
                     </span>
                     <span className="text-[14px] font-mono text-[var(--t1)]">{emb.token_prefix}****************</span>
                   </div>
                   <button className="opacity-0 group-hover:opacity-100 p-2 text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--bg-muted)] rounded transition-all">
                      <Copy size={16} />
                   </button>
                </div>

                <div className="space-y-4">
                   <div>
                      <span className="flex items-center gap-2 text-[12px] text-[var(--t3)] font-semibold uppercase mb-2">
                        <Globe size={14}/> Whitelisted CORS Domains
                      </span>
                      <div className="flex flex-wrap gap-2">
                         {emb.allowed_domains.map((domain, idx) => (
                            <span key={idx} className="bg-[var(--bg-muted)] border border-[var(--b2)] px-2.5 py-1 rounded text-[12px] font-mono text-[var(--t1)] hover:border-[var(--c-blue)]/50 transition-colors cursor-pointer">
                              {domain}
                            </span>
                         ))}
                      </div>
                   </div>
                   
                   <div className="flex justify-between items-center text-[12px] border-t border-[var(--b2)] pt-4">
                      <span className="flex items-center gap-2 text-[var(--t3)]"><Zap size={14}/> Executed Sub-Queries (MTD)</span>
                      <span className="font-mono text-[var(--t1)] font-medium bg-[#15171b] border border-[var(--b3)] px-2 py-0.5 rounded">{emb.monthly_requests.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-[12px]">
                      <span className="flex items-center gap-2 text-[var(--t3)]"><Clock size={14}/> Key Generated</span>
                      <span className="font-mono text-[var(--t1)] font-medium">{new Date(emb.created_at).toLocaleDateString()}</span>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
