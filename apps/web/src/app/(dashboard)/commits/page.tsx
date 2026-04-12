"use client";

import React, { useState, useEffect } from "react";
import { GitCommit, GitBranch, GitMerge, FileText, CheckCircle2, Clock, Terminal, ChevronRight, User, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores";

interface DiffFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string;
}

interface CommitLog {
  id: string;
  message: string;
  author: string;
  avatar: string | null;
  timestamp: string;
  is_ai: boolean;
  branch: string;
  files: DiffFile[];
}

export default function VersionControlPage() {
  const [commits, setCommits] = useState<CommitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommitId, setActiveCommitId] = useState<string | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchCommits = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/v1/commits/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const validCommits = Array.isArray(data) ? data : [];
        setCommits(validCommits);
        if (validCommits.length > 0) {
          setActiveCommitId(validCommits[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch commits", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommits();
  }, [token]);

  const activeCommit = commits.find(c => c.id === activeCommitId);

  const renderPatchLine = (line: string, i: number) => {
    if (line.startsWith("+")) {
      return (
        <div key={i} className="bg-[var(--c-green-bg)] text-[var(--c-green)] px-4 py-0.5 font-mono text-[12px] whitespace-pre flex">
          <span className="select-none inline-block w-6 text-right mr-4 opacity-50">+</span>
          <span>{line.substring(1)}</span>
        </div>
      );
    }
    if (line.startsWith("-")) {
      return (
        <div key={i} className="bg-[var(--c-red-bg)] text-[var(--c-red)] px-4 py-0.5 font-mono text-[12px] whitespace-pre flex">
          <span className="select-none inline-block w-6 text-right mr-4 opacity-50">-</span>
          <span>{line.substring(1)}</span>
        </div>
      );
    }
    if (line.startsWith("@@")) {
      return (
        <div key={i} className="bg-[var(--bg-muted)] text-[var(--c-blue)] px-4 py-1.5 font-mono text-[11px] whitespace-pre border-y border-[var(--b2)] my-1">
          {line}
        </div>
      );
    }
    return (
      <div key={i} className="text-[var(--t2)] px-4 py-0.5 font-mono text-[12px] whitespace-pre flex">
        <span className="select-none inline-block w-6 text-right mr-4 opacity-30"> </span>
        <span>{line}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page-content animate-in h-screen flex flex-col overflow-hidden">
      <div className="page-header shrink-0 mb-0 border-b border-[var(--b2)] pb-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <GitCommit size={20} className="text-[var(--t1)]" />
            <span className="text-[var(--t3)] font-normal">dataflow-ai /</span> Version Control
          </h1>
          <p className="page-subtitle">Track structural infrastructure patches and autonomous AI-driven code heals.</p>
        </div>
        <div className="page-header-actions">
           <div className="flex items-center gap-3 bg-[var(--bg-muted)] border border-[var(--b2)] px-3 py-1.5 rounded-md text-[13px] text-[var(--t2)] font-mono">
              <GitBranch size={14} className="text-[var(--c-blue)]" /> main
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Commit Timeline */}
        <div className="w-1/3 border-r border-[var(--b2)] flex flex-col bg-[var(--bg-base)] overflow-y-auto">
           <div className="p-4 border-b border-[var(--b2)] bg-[var(--bg-card)] sticky top-0 z-10 font-medium text-[13px] text-[var(--t1)]">
             Commit History
           </div>
           
           <div className="flex-1 relative">
              <div className="absolute left-[27px] top-0 bottom-0 w-px bg-[var(--b2)]"></div>
              
              <div className="py-2">
                {commits.map((commit, idx) => (
                  <div 
                    key={commit.id} 
                    onClick={() => setActiveCommitId(commit.id)}
                    className={`relative cursor-pointer transition-colors group ${activeCommitId === commit.id ? 'bg-[var(--bg-muted)]' : 'hover:bg-[var(--bg-card)]'}`}
                  >
                     <div className="absolute left-[24px] top-4 w-2 h-2 rounded-full border-2 border-[var(--bg-base)] shadow-sm z-10 bg-[var(--c-blue)] group-hover:scale-125 transition-transform"></div>
                     
                     <div className="pl-12 pr-4 py-4">
                        <div className="flex items-center gap-2 mb-1.5 line-clamp-1">
                          {commit.is_ai ? (
                            <Sparkles size={14} className="text-[var(--c-purple)] shrink-0" />
                          ) : (
                            <User size={14} className="text-[var(--t3)] shrink-0" />
                          )}
                          <span className={`text-[13px] font-semibold truncate ${commit.is_ai ? 'text-[var(--c-purple)]' : 'text-[var(--t1)]'}`}>
                            {commit.author}
                          </span>
                        </div>
                        
                        <p className={`text-[14px] font-medium leading-snug mb-2 ${activeCommitId === commit.id ? 'text-[var(--t1)]' : 'text-[var(--t2)]'}`}>
                          {commit.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--t3)]">
                           <span>{new Date(commit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           <span className="bg-[var(--bg-card)] border border-[var(--b2)] px-1.5 py-0.5 rounded text-[10px]">
                             {commit.id}
                           </span>
                        </div>
                     </div>
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} className="text-[var(--t3)]" />
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Right Pane: Commit Detail & Diff Viewer */}
        <div className="w-2/3 flex flex-col bg-[var(--bg-card)] overflow-hidden">
           {activeCommit ? (
             <>
               {/* Commit Header */}
               <div className="p-6 border-b border-[var(--b2)] shrink-0 bg-gradient-to-b from-[var(--bg-muted)] to-[var(--bg-card)]">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-[18px] font-semibold text-[var(--t1)] leading-snug max-w-[80%]">
                      {activeCommit.message}
                    </h2>
                    <div className="flex items-center gap-2 font-mono text-[12px] bg-[#0d1117] border border-[var(--b2)] px-2.5 py-1 rounded-md shadow-sm">
                      <GitCommit size={14} className="text-[var(--c-blue)]" />
                      <span className="text-[var(--t1)]">{activeCommit.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-[13px]">
                     <div className="flex items-center gap-2">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${activeCommit.is_ai ? 'bg-gradient-to-br from-[var(--c-purple)] to-[var(--c-indigo)]' : 'bg-gradient-to-br from-[var(--c-blue)] to-blue-800'}`}>
                         {activeCommit.avatar || (activeCommit.is_ai ? <Sparkles size={12}/> : 'U')}
                       </div>
                       <span className="text-[var(--t1)] font-medium">{activeCommit.author}</span>
                       <span className="text-[var(--t3)] ml-1">committed on {new Date(activeCommit.timestamp).toLocaleDateString()}</span>
                     </div>
                     
                     <div className="flex items-center gap-3 text-[12px] font-medium">
                       <span className="text-[var(--t2)] flex items-center gap-1.5">
                         <FileText size={14} /> {activeCommit.files.length} changed file{activeCommit.files.length !== 1 ? 's' : ''}
                       </span>
                       <span className="text-[var(--c-green)]">+{activeCommit.files.reduce((a,f)=>a+f.additions, 0)}</span>
                       <span className="text-[var(--c-red)]">-{activeCommit.files.reduce((a,f)=>a+f.deletions, 0)}</span>
                     </div>
                  </div>
               </div>

               {/* Files Diff View */}
               <div className="flex-1 overflow-y-auto p-6 bg-[#07090e]">
                 {activeCommit.files.map((file, idx) => (
                   <div key={idx} className="border border-[var(--b2)] rounded-lg shadow-sm overflow-hidden mb-6 bg-[#0d1117]">
                      {/* File Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--b2)] bg-[var(--bg-card)]">
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[var(--t3)] border border-[var(--b2)] px-1.5 rounded tracking-wide uppercase">
                               {file.status}
                            </span>
                            <span className="text-[13px] font-mono text-[var(--t1)]">{file.filename}</span>
                         </div>
                      </div>
                      
                      {/* File Diff Content */}
                      <div className="py-2 overflow-x-auto">
                        {file.patch.split('\\n').map((line, lineIdx) => renderPatchLine(line, lineIdx))}
                      </div>
                   </div>
                 ))}
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-[var(--t3)]">
                <GitCommit size={48} className="mb-4 opacity-20" />
                <p>Select a commit to view diff details</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
