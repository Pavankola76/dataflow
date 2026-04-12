"use client";

import React, { useState, useEffect } from "react";
import { Users, MessageSquare, Play, Save, Loader2, MousePointer2, FileCode2, Share2, History, ChevronRight, Activity } from "lucide-react";
import { useAuthStore } from "@/stores";

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  status: string;
  cursor_line: number;
  cursor_char: number;
}

export default function CollaboratePage() {
  const [sessionUsers, setSessionUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock SQL Code Content
  const [code, setCode] = useState(
    "WITH current_mrr AS (\n" +
    "  SELECT\n" +
    "    subscription_id,\n" +
    "    SUM(monthly_price) as mrr\n" +
    "  FROM silver.dim_subscriptions\n" +
    "  WHERE status = 'active'\n" +
    "  GROUP BY 1\n" +
    ")\n\n" +
    "SELECT * FROM current_mrr\n" +
    "ORDER BY mrr DESC\n" +
    "LIMIT 100;"
  );

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchSession = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/collaborate/session", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setSessionUsers(data);
        } else {
          setSessionUsers([]);
        }
      } catch (err) {
        console.error("Failed to fetch collaborate session", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page-content animate-in h-screen flex flex-col overflow-hidden">
      <div className="page-header shrink-0 mb-6 border-b border-[var(--b2)] pb-4 flex justify-between items-center w-full">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users size={20} className="text-[var(--c-amber)]" />
            <span className="text-[var(--t3)] font-normal flex items-center gap-1.5"><FileCode2 size={16}/> models /</span>
            mrr_computation.sql
          </h1>
          <p className="page-subtitle">Multiplayer Workspace: Real-Time Collaborative AST Editing</p>
        </div>
        
        {/* Presence Avatars */}
        <div className="flex items-center gap-4">
           <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[var(--c-blue)] border-2 border-[var(--bg)] flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10" title="You">
                 You
              </div>
              {sessionUsers.map((user, idx) => (
                 <div key={user.id} className="w-8 h-8 rounded-full border-2 border-[var(--bg)] flex items-center justify-center text-[12px] font-bold text-black shadow-sm" style={{ backgroundColor: user.color, zIndex: 9 - idx }} title={`${user.name} (${user.status})`}>
                    {user.name.substring(0,2).toUpperCase()}
                 </div>
              ))}
           </div>
           
           <div className="w-px h-6 bg-[var(--b2)] mx-2"></div>
           
           <button className="bg-[var(--bg-card)] hover:bg-[var(--bg-muted)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
             <Share2 size={14} className="text-[var(--t3)]" /> Share
           </button>
           <button className="bg-[var(--c-indigo)] hover:bg-indigo-500 text-white border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
             <Play size={14} className="fill-white" /> Run Model
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 pb-6">
         
         {/* Main Editor Surface */}
         <div className="flex-1 bg-[#0d1015] border border-[var(--b2)] rounded-xl flex flex-col overflow-hidden relative shadow-sm">
            <div className="bg-[#15171b] border-b border-[var(--b2)] px-4 py-2 flex justify-between items-center text-[12px] text-[var(--t3)]">
               <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[var(--t1)] font-medium">
                     <FileCode2 size={14} className="text-[var(--c-blue)]"/> mrr_computation.sql
                  </span>
                  <span className="flex items-center gap-1"><History size={12}/> Last edited by Jane 2m ago</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[var(--c-green)]"><Activity size={12}/> WebSocket Protected Sync</span>
                  <span className="font-mono bg-[var(--bg-muted)] border border-[var(--b3)] px-1.5 py-0.5 rounded">UTF-8</span>
               </div>
            </div>
            
            <div className="flex-1 relative font-mono text-[14px] leading-relaxed overflow-hidden flex">
               {/* Line Numbers */}
               <div className="w-12 shrink-0 bg-[#0a0c10] border-r border-[var(--b2)] flex flex-col items-end py-4 pr-3 text-[var(--b3)] select-none">
                  {[1,2,3,4,5,6,7,8,9,10,11].map(n => <div key={n} className="h-6">{n}</div>)}
               </div>
               
               {/* Code Content */}
               <div className="flex-1 p-4 relative overflow-auto">
                  
                  {/* Mock Remote Cursors - Absolute Positioned over text */}
                  {sessionUsers.map(user => (
                     <div key={user.id} 
                          className="absolute pointer-events-none z-10 flex flex-col items-start transition-all duration-300 ease-out"
                          style={{ 
                            top: `${(user.cursor_line - 1) * 24 + 16}px`, 
                            left: `${(user.cursor_char * 8.4) + 16}px` 
                          }}>
                        <MousePointer2 size={14} className="fill-current -rotate-12" style={{ color: user.color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                        <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded text-black mt-1 shadow-sm" style={{ backgroundColor: user.color }}>
                          {user.name}
                        </span>
                        <div className="w-0.5 h-4 mt-0.5 animate-pulse" style={{ backgroundColor: user.color }}></div>
                     </div>
                  ))}

                  <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-transparent text-[var(--t1)] outline-none resize-none"
                    spellCheck="false"
                    style={{ lineHeight: '24px' }}
                  />
               </div>
            </div>
         </div>

         {/* Collaboration Sidebar */}
         <div className="w-72 shrink-0 flex flex-col gap-4">
            <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-xl flex-1 flex flex-col overflow-hidden">
               <div className="bg-[#15171b] border-b border-[var(--b2)] px-4 py-3 font-medium text-[13px] flex items-center gap-2">
                 <MessageSquare size={14} className="text-[var(--t3)]" /> Team Chat
               </div>
               <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                  <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-[var(--c-purple)] flex items-center justify-center text-[9px] font-bold text-black shrink-0">JD</div>
                     <div>
                        <div className="flex items-center gap-2 mb-0.5">
                           <span className="text-[13px] font-medium text-[var(--t1)]">Jane Doe</span>
                           <span className="text-[10px] text-[var(--t3)]">10:42 AM</span>
                        </div>
                        <p className="text-[13px] text-[var(--t2)] bg-[var(--bg-muted)] p-2 rounded-lg rounded-tl-none border border-[var(--b2)]">
                           I'm updating the `mrr` computation to explicitly filter entirely on `active` status markers.
                        </p>
                     </div>
                  </div>
                  
                  <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-[var(--c-amber)] flex items-center justify-center text-[9px] font-bold text-black shrink-0">AS</div>
                     <div>
                        <div className="flex items-center gap-2 mb-0.5">
                           <span className="text-[13px] font-medium text-[var(--t1)]">Alex Smith</span>
                           <span className="text-[10px] text-[var(--t3)]">10:44 AM</span>
                        </div>
                        <p className="text-[13px] text-[var(--t2)] bg-[var(--bg-muted)] p-2 rounded-lg rounded-tl-none border border-[var(--b2)]">
                           Sounds good. I'll review the limit clause on line 10.
                        </p>
                     </div>
                  </div>
               </div>
               <div className="p-3 border-t border-[var(--b2)] bg-[var(--bg-card)]">
                  <input type="text" placeholder="Message team..." className="w-full bg-[#0a0c10] border border-[var(--b2)] rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:border-[var(--c-blue)] transition-colors" />
               </div>
            </div>
         </div>
         
      </div>
    </div>
  );
}
