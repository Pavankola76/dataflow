"use client";

import React, { useState, useEffect } from "react";
import { BookMarked, Search, Plus, Filter, Link2, ShieldCheck, Clock, User, Info, Database, Loader2, BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores";

interface GlossaryTerm {
  id: string;
  term: string;
  abbreviation: string;
  definition: string;
  calculation: string | null;
  steward: string;
  status: string;
  related_assets: string[];
}

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchTerms = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/glossary/terms", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
           const data = await res.json();
           setTerms(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch glossary terms", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  const filteredTerms = terms.filter(t => 
    t.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content animate-in h-screen flex flex-col overflow-hidden">
      <div className="page-header shrink-0 mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BookMarked size={20} className="text-[var(--c-amber)]" />
            Business Glossary
          </h1>
          <p className="page-subtitle">The certified enterprise semantic layer mapping structural schemas to human definitions.</p>
        </div>
        <div className="page-header-actions">
           <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
             <Filter size={14} className="text-[var(--t3)]" /> Filters
           </button>
           <button className="bg-[var(--c-amber)] hover:bg-yellow-500 text-black border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
             <Plus size={14} /> Propose Term
           </button>
        </div>
      </div>

      <div className="mb-6 shrink-0 relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t3)]" size={16} />
        <input 
          type="text" 
          placeholder="Search semantic ontology (e.g. 'MRR' or 'Churn')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg pl-9 pr-4 py-2 text-[14px] text-[var(--t1)] focus:outline-none focus:border-[var(--c-amber)] transition-colors placeholder-[var(--t3)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-12">
        {filteredTerms.map((term) => (
          <div key={term.id} className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl shadow-sm overflow-hidden hover:border-[var(--c-amber)]/50 transition-colors">
             <div className="px-6 py-5">
                
                {/* Header Context */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-[var(--c-amber-bg)] border border-[var(--c-amber)]/30 flex items-center justify-center text-[var(--c-amber)] font-bold text-[18px]">
                        {term.abbreviation.substring(0,2)}
                     </div>
                     <div>
                       <h2 className="text-[16px] font-semibold text-[var(--t1)] flex items-center gap-2">
                         {term.term}
                         <span className="text-[12px] text-[var(--t3)] font-mono ml-1 bg-[#1a1c23] px-1.5 py-0.5 rounded border border-[var(--b2)]">
                           {term.abbreviation}
                         </span>
                       </h2>
                       <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--t3)] font-medium">
                         <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider border flex flex-row items-center gap-1 ${term.status === 'Certified' ? 'bg-[var(--c-green-bg)] text-[var(--c-green)] border-[var(--c-green)]/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                           {term.status === 'Certified' && <ShieldCheck size={10} />}
                           {term.status}
                         </span>
                         <span className="flex items-center gap-1.5"><User size={12} className="text-[var(--c-blue)]"/> Steward: {term.steward}</span>
                       </div>
                     </div>
                  </div>
                </div>

                {/* Sub Definitions */}
                <div className="pl-[52px]">
                   <p className="text-[14px] text-[var(--t2)] leading-relaxed mb-4">
                     {term.definition}
                   </p>

                   {term.calculation && (
                     <div className="mb-4">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--t3)] mb-1.5 block">Calculation Engine</span>
                       <div className="bg-[#0a0c10] border border-[var(--b2)] rounded-lg p-3 inline-block">
                         <code className="text-[13px] font-mono text-[var(--c-blue)]">
                           {term.calculation}
                         </code>
                       </div>
                     </div>
                   )}

                   <div>
                     <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--t3)] mb-2 flex items-center gap-1.5">
                       <Database size={12}/> Related Schema Assets
                     </span>
                     <div className="flex flex-wrap gap-2">
                       {term.related_assets.map((asset, idx) => (
                         <div key={idx} className="flex items-center gap-1.5 bg-[var(--bg-muted)] border border-[var(--b2)] rounded px-2.5 py-1 hover:border-[var(--c-blue)]/50 cursor-pointer transition-colors group">
                           <BookOpen size={12} className="text-[var(--t3)] group-hover:text-[var(--c-blue)] transition-colors"/>
                           <span className="text-[12px] font-mono text-[var(--t2)] group-hover:text-[var(--t1)] transition-colors">{asset}</span>
                         </div>
                       ))}
                     </div>
                   </div>

                </div>
             </div>
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[var(--b2)] rounded-xl">
             <BookMarked size={32} className="mx-auto text-[var(--t3)] mb-3 opacity-50" />
             <h3 className="text-[var(--t1)] font-medium">No business terms found</h3>
             <p className="text-[var(--t3)] text-[13px] mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
