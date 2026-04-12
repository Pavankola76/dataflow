"use client";
import React from "react";
import { Shield, ChevronRight, Users, KeyRound, Workflow } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>Config</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">SAML/SSO Integration</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Shield size={40} className="text-[#3b82f6]" />
         SAML/SSO Integration
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Connect DataFlow AI securely directly towards established providers like Okta, Azure Active Directory natively, or Google Workspace strictly to mathematically mandate strong 2FA requirements and stringent foundational enterprise identity verification policies.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Enterprise Identity Management</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Static password-based internal authorizations perpetually represent massive structural vectors natively exploited by malicious operations daily. 
      </p>
      
      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        Tying directly natively into your unified centralized corporate Identity Provider (IdP) cleanly guarantees mathematically that when a compromised employee exits the secure organization, their localized access dynamically inside DataFlow AI completely truncates and securely is revoked instantly with strictly zero human administrative delays.
      </p>

      {/* Official Azure Style Important Note Box */}
      <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] p-5 rounded-r-lg mb-12 max-w-3xl flex gap-3">
         <Workflow className="text-[#3b82f6] shrink-0 mt-0.5" size={20} />
         <div>
            <h4 className="text-white font-bold mb-2">Automated Lifecycle Actions</h4>
            <p className="text-[#cbd5e1] leading-relaxed">
               DataFlow AI fully supports the SCIM 2.0 provisioning protocol intuitively. Active Directory group restructures perfectly parallel synchronized mutations across your platform roles autonomously mathematically.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Just-in-Time Provisioning Workflows</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         To completely minimize configuration friction structurally for incoming new engineering hires, securely mapping SAML attributes strictly activates our deeply integrated Just-in-Time native user provisioning framework logically:
      </p>

      {/* Clean Step Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Users size={20} className="text-[#f59e0b]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Payload Definitions</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Configure your Identity Provider (Okta/Entra) securely to systematically export custom array structural payload parameters mapping uniquely active user groups mathematically correctly (E.g. <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono tracking-wider">employee_group: ['DataOps', 'FullTime']</code>).
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <KeyRound size={20} className="text-[#10b981]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Logical Graph Mapping</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Inside DataFlow AI configuration tables intuitively, map the generic attribute key-value extraction phrase <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono tracking-wider">DataOps</code> dynamically mapping logically towards the explicit active Platform Role, like the administrative <code className="bg-[#1e293b] text-[#cbd5e1] px-1.5 py-0.5 rounded text-sm font-mono tracking-wider">Data Engineer</code> parameter class cleanly.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Shield size={20} className="text-[#3b82f6]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Complete Autonomy</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  When a freshly hired engineering recruit physically logs inside via Okta structurally during their very first baseline integration day logically, the central account instantly registers dynamically and correct absolute baseline permissions establish seamlessly via JSON evaluation. Exactly absolutely zero manual administrator synchronization efforts universally required natively hereafter.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
