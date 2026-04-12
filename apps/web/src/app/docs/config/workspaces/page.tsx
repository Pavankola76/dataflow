"use client";
import React from "react";
import { Settings, ChevronRight, GitBranch, ShieldAlert } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#8b5cf6] font-semibold mb-8 uppercase tracking-wider">
         <span>Config</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Managing Workspaces</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Settings size={40} className="text-[#8b5cf6]" />
         Managing Workspaces
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Create completely isolated organizational Workspaces equivalent conceptually to unique 'Projects'. Restrict and keep experimental staging pipelines entirely separated from mission-critical production runtime architectures.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Environment Isolation</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Dynamically building and testing a newly architected, highly destructive pipeline transformation against a live production transactional database is universally considered a terrible, fireable error. 
      </p>
      
      {/* Alert Note */}
      <div className="bg-[#8b5cf6]/10 border-l-4 border-[#8b5cf6] p-5 rounded-r-lg mb-12 max-w-3xl flex gap-3">
         <ShieldAlert size={20} className="text-[#8b5cf6] shrink-0 mt-0.5" />
         <div>
            <h4 className="text-white font-bold mb-2">Hard Isolation Architecture</h4>
            <p className="text-[#cbd5e1] leading-relaxed">
               Workspaces logically solve this parameter conflict. A Workspace mathematically behaves as an entirely disparate tenant instance, seamlessly replicating your DataFlow AI design topology while securely enforcing strict Environment Variable distincts (e.g. mapping strictly to <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono break-all line-clamp-1">db_secret_dev</code> vs <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.2 rounded font-mono break-all line-clamp-1">db_secret_prod</code>).
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Cross-Workspace Promotion Integrations</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         A standard high-fidelity CI/CD software development framework maps beautifully onto Workspaces.
      </p>

      {/* Clean Numbered Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] text-white p-2 rounded w-8 h-8 flex justify-center items-center font-bold text-[#f59e0b] shrink-0">1</div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Development Workspace</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Engineers organically connect to localized sample databases and heavily mocked API endpoints natively. The intelligent AI Copilot securely generates the initial raw DAG geometry safely here, allowing endless iteration without structural risk constraints.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] text-white p-2 rounded w-8 h-8 flex justify-center items-center font-bold text-[#3b82f6] shrink-0">2</div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Staging Workspace</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  JSON Configurations are merged effortlessly via underlying Git branch mapping. DataFlow AI mathematically points the data connectors dynamically towards the secure Staging Snowflake environment. Complex automated testing frameworks and remote Great Expectations QA validation scripts securely execute mathematically here.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] text-white p-2 rounded w-8 h-8 flex justify-center items-center font-bold text-[#10b981] shrink-0">3</div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Production Workspace</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Once successfully verified across all tests, the unified declarative code branches seamlessly deploy towards Prod. This highly restricted state is securely locked to verified Administrator or specific Engineering approval layers only, deploying the logical graph processing directly against multi-billion row live server architectures.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
