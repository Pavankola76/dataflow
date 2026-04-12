"use client";
import React from "react";
import { Cloud, ChevronRight, Server, Shield, Network } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0] font-sans">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#f59e0b] font-semibold mb-8 uppercase tracking-wider">
         <span>Cloud</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Deploying to AWS</span>
      </div>

      <h1 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
         <Cloud size={40} className="text-[#f59e0b]" />
         Deploying to AWS
      </h1>
      
      <p className="text-xl text-[#94a3b8] mb-12 leading-relaxed max-w-3xl">
        Deploy the DataFlow AI execution plane directly into your private <code className="bg-[#1e293b] text-[#f59e0b] px-1.5 py-0.5 rounded text-sm font-mono">AWS VPC</code>. Securely leverage native integrations with AWS MSK for Kafka streaming and AWS EMR for Apache Spark batch processing.
      </p>

      <h2 className="text-2xl font-bold text-white mb-6">AWS Control Plane Architecture</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
        While DataFlow AI provides a completely managed SaaS interface, enterprise customers handling heavily regulated, sensitive healthcare (HIPAA) or financial (SOC2) data natively prefer deploying the Compute Engine straight into their Amazon Web Services environment. 
      </p>
      
      <p className="text-[#cbd5e1] mb-12 leading-relaxed max-w-3xl text-lg">
        This dual-plane approach guarantees that the DataFlow AI centralized control systems instruct the execution graphs, but your highly sensitive PII datasets strictly never leave your own controlled AWS network topology. All computations are securely executed entirely inside your personal boundaries.
      </p>

      {/* Official AWS Style Important Note */}
      <div className="bg-[#f59e0b]/10 border-l-4 border-[#f59e0b] p-5 rounded-r-lg mb-12 max-w-3xl">
         <h4 className="text-white font-bold mb-2 flex items-center gap-2">
           <Shield size={18} className="text-[#f59e0b]" />
           IAM Cross-Account Trust
         </h4>
         <p className="text-[#cbd5e1] leading-relaxed">
            DataFlow AI requires a highly constrained Cross-Account IAM Role to provision transient EMR nodes inside your VPC. We strongly enforce the principles of least privilege. The exact JSON IAM policy required for secure provisioning is available inside your workspace settings.
         </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Native Integrated Compute Services</h2>
      <p className="text-[#cbd5e1] mb-8 leading-relaxed max-w-3xl text-lg">
         To minimize cross-network egress fees, DataFlow AI seamlessly intercepts native AWS data mechanisms rather than relying on external clusters to perform heavy analysis.
      </p>

      {/* Clean Feature Listing */}
      <div className="space-y-8 mb-12 max-w-4xl">
         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Network size={20} className="text-[#3b82f6]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Amazon MSK (Managed Kafka)</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  DataFlow AI automatically manages and routes your Kafka brokers directly into sub-second Flink CDC streaming applications instantly without the enormous overhead of manual ZooKeeper administrative operations.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Server size={20} className="text-[#f59e0b]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Amazon EMR (Elastic MapReduce)</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Transient PySpark clusters spin up automatically mere seconds before your massive data pipeline jobs are slated to begin. They process the required transformations natively against S3, and turn down instantly to ensure your AWS bill remains completely optimized.
               </p>
            </div>
         </div>

         <div className="flex gap-4 items-start">
            <div className="mt-1 bg-[#1e293b] p-2 rounded shrink-0">
               <Cloud size={20} className="text-[#10b981]" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">AWS S3 & Glue Data Catalog</h3>
               <p className="text-[#94a3b8] leading-relaxed">
                  Native ingestion directly into S3 object storage seamlessly registers schema definitions backwards to the AWS Glue Data Catalog. This directly implies that DataFlow AI's generated catalog intelligently mirrors exactly what your other AWS machine learning products observe natively.
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}
