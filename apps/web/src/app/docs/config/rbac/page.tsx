"use client";
import React from "react";
import { Shield, ChevronRight, Lock, Key, Eye } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>Config</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Role-Based Access (RBAC)</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Shield size={40} className="text-[#3b82f6]" />
         Role-Based Access (RBAC)
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Restrict administrative access dynamically based on organizational roles. Allow Data Analysts to query metrics using the AI Copilot while explicitly restricting them from modifying underlying PySpark deployment code structures.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Principle of Least Privilege</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        A dynamically functioning enterprise data platform invites multiple differing skill sets. Deep security teams fundamentally do not want Marketing Analysts possessing the active permissions necessary to delete entire Snowflake schema environments or inadvertently export PII endpoints to external tracking vendors. 
      </p>
      
      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        The RBAC (Role-Based Access Control) configuration model controls these boundaries seamlessly and mathematically at the edge tier before execution states can be reached.
      </p>

      {/* Clean Feature Listing */}
      <h3 className="text-xl font-bold text-white mb-6 mt-8">Standard Hierarchy Roles</h3>
      
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Lock size={20} className="text-[#f59e0b]" />
            </div>
            <div>
               <h4 className="text-xl font-bold text-white mb-2">Administrator</h4>
               <p className="text-[#94a3b8] leading-relaxed">
                  Grants absolute, complete organizational control. Possesses complete billing transparency access, environment variable mutation rights, and global destructive database deletion controls.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Key size={20} className="text-[#10b981]" />
            </div>
            <div>
               <h4 className="text-xl font-bold text-white mb-2">Data Engineer</h4>
               <p className="text-[#94a3b8] leading-relaxed">
                  Permitted to visually build, mathematically modify, and aggressively scale processing pipelines via the Canvas interface, as well as author unconstrained dbt models natively. Entirely restricted from managing billing infrastructure.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Eye size={20} className="text-[#3b82f6]" />
            </div>
            <div>
               <h4 className="text-xl font-bold text-white mb-2">Data Analyst</h4>
               <p className="text-[#94a3b8] leading-relaxed">
                  Can freely access the AI natural-language Copilot and strictly view the static Observatory topological graphs. Hard-restricted from modifying underlying connector infrastructure or viewing raw unmasked PII datasets mapping natively from external APIs.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
