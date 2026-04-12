"use client";

import React, { useState, useEffect } from "react";
import { Brain, Search, Plus, Database, Clock, Zap, Target, Loader2, Link2, ShieldCheck, User as UserIcon, XCircle, Edit3 } from "lucide-react";
import { useAuthStore } from "@/stores";

interface MemoryVector {
  id: string;
  context: string;
  source: string;
  weight: number;
  usage_count: number;
  status: string;
  last_applied: string;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<MemoryVector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchMemories = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/memory/vectors", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMemories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch memory vectors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  const filteredMemories = memories.filter(m => 
    m.context.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content animate-in h-screen flex flex-col overflow-hidden">
      <div className="page-header shrink-0 mb-6 border-b border-[var(--b2)] pb-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Brain size={20} className="text-[var(--c-purple)]" />
            AI Learning & Memory System
          </h1>
          <p className="page-subtitle">Inspect and govern the underlying semantic context vectors that power the autonomous text-to-SQL engine.</p>
        </div>
        <div className="page-header-actions">
           <button className="bg-[var(--c-purple)] hover:bg-purple-500 text-white border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
             <Plus size={14} /> Inject Context Rule
           </button>
        </div>
      </div>

      <div className="mb-6 shrink-0 relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t3)]" size={16} />
        <input 
          type="text" 
          placeholder="Search learned vectors (e.g. 'amount_usd' or 'join key')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg pl-9 pr-4 py-2 text-[14px] text-[var(--t1)] focus:outline-none focus:border-[var(--c-purple)] transition-colors placeholder-[var(--t3)]"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-12">
        {filteredMemories.map((vector) => (
          <div key={vector.id} className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl shadow-sm overflow-hidden hover:border-[var(--c-purple)]/50 transition-colors group relative">
             
             {/* Weight Indicator Bar */}
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--c-purple)] to-transparent opacity-80"></div>
             
             <div className="p-5 pl-7 relative">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${vector.status === 'Active' ? 'bg-[var(--c-green-bg)] text-[var(--c-green)] border-[var(--c-green)]/30' : 'bg-[var(--c-amber-bg)] text-[var(--c-amber)] border-[var(--c-amber)]/30 animate-pulse'}`}>
                        {vector.status}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--t3)] px-2 bg-[var(--bg-muted)] border border-[var(--b2)] rounded truncate max-w-[150px]">{vector.id}</span>
                   </div>
                   
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-[var(--t3)] hover:text-[var(--c-blue)] hover:bg-[var(--c-blue-bg)] rounded transition-colors" title="Edit Vector">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-1.5 text-[var(--t3)] hover:text-[var(--c-red)] hover:bg-[var(--c-red-bg)] rounded transition-colors" title="Delete Vector">
                        <XCircle size={14} />
                      </button>
                   </div>
                </div>

                <div className="bg-[#0a0c10] border border-[var(--b2)]/60 rounded-lg p-4 mb-4 shadow-inner">
                   <p className="text-[15px] text-[var(--t1)] font-medium leading-relaxed font-mono tracking-tight">
                     "{vector.context}"
                   </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                   <div>
                     <span className="flex items-center gap-1.5 text-[10px] text-[var(--t3)] uppercase font-semibold mb-1">
                       <Target size={12} className="text-[var(--t2)]"/> Priority Weight
                     </span>
                     <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-[#15171b] rounded-full overflow-hidden flex-1">
                           <div className="h-full bg-[var(--c-purple)]" style={{ width: `${vector.weight * 100}%` }}></div>
                        </div>
                        <span className="text-[13px] font-mono text-[var(--t1)]">{vector.weight.toFixed(2)}</span>
                     </div>
                   </div>

                   <div>
                     <span className="flex items-center gap-1.5 text-[10px] text-[var(--t3)] uppercase font-semibold mb-1">
                       <Zap size={12} className="text-[var(--c-yellow)]"/> Global Inferences
                     </span>
                     <span className="text-[14px] font-mono text-[var(--t1)]">{vector.usage_count.toLocaleString()} queries</span>
                   </div>
                   
                   <div className="col-span-2">
                     <span className="flex items-center gap-1.5 text-[10px] text-[var(--t3)] uppercase font-semibold mb-1">
                       <UserIcon size={12} className="text-[var(--c-blue)]"/> Memory Origin
                     </span>
                     <span className="text-[13px] text-[var(--t2)]">{vector.source}</span>
                     <span className="text-[11px] text-[var(--t3)] ml-2">
                       (Last applied: {new Date(vector.last_applied).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
                     </span>
                   </div>
                </div>

             </div>
          </div>
        ))}
        
        {filteredMemories.length === 0 && (
          <div className="text-center py-12 border border-dashed border-[var(--b2)] rounded-xl">
             <Brain size={32} className="mx-auto text-[var(--t3)] mb-3 opacity-50" />
             <h3 className="text-[var(--t1)] font-medium">No cognitive vectors found</h3>
             <p className="text-[var(--t3)] text-[13px] mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
