"use client";

import React from "react";
import { Book, Shield, Link, CheckSquare, Search } from "lucide-react";

export default function CatalogServiceDoc() {
  return (
    <div className="text-[#e2e8f0]">
      <h1 className="text-4xl font-extrabold text-white mb-6">Catalog & Governance</h1>
      <p className="text-xl text-[#94a3b8] mb-10 leading-relaxed border-b border-[#1e293b] pb-8">
        If you don&apos;t trust your data, you can&apos;t use it. The Unified Catalog is the central nerve system, providing active metadata tracking, interactive data dictionaries, automatic lineage mapping, and stringent SLA contracts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Search size={28} className="text-[#3b82f6] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Automated Indexing</h3>
            <p className="text-[#94a3b8] text-sm">Every table generated in the Lakehouse is immediately documented. Columns are analyzed textually by AI to suggest clear business descriptions.</p>
         </div>
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Link size={28} className="text-[#10b981] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Column-Level Lineage</h3>
            <p className="text-[#94a3b8] text-sm">Trace the exact journey of a metric. If `fct_revenue` drops, trace it visually back up the graph to find the exact broken Airflow task or upstream API.</p>
         </div>
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Shield size={28} className="text-[#f43f5e] mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">PII Security Masking</h3>
            <p className="text-[#94a3b8] text-sm">LLMs scan schemas during discovery. Columns resembling Emails, SSNs, or CC numbers are tagged `Restricted` and logically hashed before landing in the Bronze layer.</p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Enforcing Data Contracts</h2>
      
      <p className="text-[#94a3b8] mb-6 leading-relaxed">
        Engineers often face issues where software teams push migrations (e.g., dropping a legacy column or changing a string to an integer) that entirely crashes downstream BI dashboards. Data Contracts prevent this mathematically.
      </p>
      
      <div className="bg-[#1e293b] p-5 rounded-lg font-mono text-sm text-[#cbd5e1] mb-10 border border-[#3b82f6]/20">
<pre>{`schema_contract:
  table: silver.dim_users
  owner: data_platform_team
  validations:
    - column: user_id
      type: uuid
      tests: [not_null, unique]
    - column: signup_date
      type: timestamp
      tests: [not_in_future]
  enforcement_mode: BLOCK`}
</pre>
      </div>

      <ul className="list-disc pl-6 space-y-3 text-[#cbd5e1] mb-10">
         <li><strong>WARN Mode:</strong> Notifies Slack channels and adds a 'Warning' flag in the catalog, but allows the pipeline to succeed.</li>
         <li><strong>BLOCK Mode:</strong> Quarantines the bad records into a dead-letter queue, forcing human intervention before corrupting the Gold layer.</li>
      </ul>
    </div>
  );
}
