"use client";
import React from "react";
import { Shield, ChevronRight, Share2, Workflow, Fingerprint } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-8 uppercase tracking-wider">
         <span>Cloud</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">VPC & Private Link</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Shield size={40} className="text-[#3b82f6]" />
         VPC & Private Link
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Configure <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">AWS PrivateLink</code> or <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono">Azure Private Endpoint</code> so your centralized data never transverses the public internet during heavy extraction and transformation processes.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">Air-Gapped Cloud Security</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        Connecting external ETL pipelines strictly to your internal VPC subnets usually requires archaic IP allowlisting policies or highly unstable reverse-SSH tunnels, which enterprise network security administrators deeply detest and often rigidly block. 
      </p>

      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        DataFlow AI fundamentally re-architects this approach. The Private Link architecture natively provides a mathematically proven, secure tunnel extending directly from our orchestrated Control Plane straight into your deeply internal private subnets, occurring completely without public internet egress mapping.
      </p>

      {/* Alert Note */}
      <div className="bg-[#3b82f6]/10 border-l-4 border-[#3b82f6] p-5 rounded-r-lg mb-12 max-w-3xl flex gap-3">
         <Fingerprint size={20} className="text-[#3b82f6] shrink-0 mt-0.5" />
         <div>
            <h4 className="text-white font-bold mb-2">SOC2 & HIPAA Compliance</h4>
            <p className="text-[#cbd5e1] leading-relaxed">
               Because Private Link tunnels traverse the underlying proprietary optical fiber backbone of AWS/Azure directly, all ingested PII data strictly bypasses standard ISP architectures. This instantly allows internal audit teams to effortlessly map strict SOC2 Type 2 controls securely onto DataFlow AI.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Enabling Connection Strategies</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         If your primary source PostgreSQL cluster completely lacks a public NAT Gateway and sits strictly inside an internal localized boundary (e.g. <code className="bg-[#1e293b] text-[#3b82f6] px-1.5 py-0.5 rounded text-sm font-mono tracking-wider">subnet-production-10.0.1.X</code>), connection requires configuring endpoint routing matching the exact SaaS provider signature.
      </p>

      {/* Clean Step Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0 w-8 h-8 flex justify-center items-center font-bold text-[#3b82f6]">1</div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Provision the Core Endpoint</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Navigate carefully into your AWS or Azure Cloud Console infrastructure settings. Explicitly target a new Private Link Endpoint mapping exactly towards the DataFlow AI SaaS central Account identifier (`arn:aws:iam::dataflow-ai`).
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0 w-8 h-8 flex justify-center items-center font-bold text-[#3b82f6]">2</div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Attach Ingress Architectures</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Ensure you firmly append a secure Ingress Security Group to the constructed endpoint matching our dynamically published logical Elastic Interface Nodes structure precisely. This selectively permits only specific packet geometries to ingress fully through the network hop.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0 w-8 h-8 flex justify-center items-center font-bold text-[#3b82f6]">3</div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Mount the Platform Connector</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Once structurally accepted fully on the console topology side, navigate directly back towards the Connectors UI page inside DataFlow AI. Securely select <i>"Connect securely via Internal Private Link"</i>. You will never jump through volatile VPN proxy hops ever again.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
