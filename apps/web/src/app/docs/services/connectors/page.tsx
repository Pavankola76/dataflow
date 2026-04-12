"use client";

import React from "react";
import { Cable, Database, Cloud, Zap } from "lucide-react";

export default function ConnectorsServiceDoc() {
  return (
    <div className="text-[#e2e8f0]">
      <h1 className="text-4xl font-extrabold text-white mb-6">Connectors & Integration</h1>
      <p className="text-xl text-[#94a3b8] mb-10 leading-relaxed border-b border-[#1e293b] pb-8">
        DataFlow AI connects everything. Whether it&apos;s an on-prem legacy PostgreSQL database, a SaaS API, or an Amazon S3 bucket, our plug-and-play connector framework handles synchronization resiliently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Cloud size={32} className="text-[#8b5cf6] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">300+ Prebuilt Integrations</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               No need to write fragile extraction scripts. Connect to Salesforce, Stripe, Shopify, REST APIs, or MongoDB instantly via OAuth or API keys. Fully compatible with Airbyte paradigms.
            </p>
         </div>
         <div className="bg-[#111827] rounded-xl p-6 border border-[#1e293b]">
            <Zap size={32} className="text-[#f59e0b] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Real-Time CDC Streams</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
               For transactional databases (PostgreSQL, MySQL), we utilize logical replication (Debezium + Kafka) to stream row-level mutations precisely as they happen, ensuring immediate analytics availability.
            </p>
         </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">Ingestion Modes</h2>
      <ul className="list-disc pl-6 space-y-4 text-[#cbd5e1] mb-10">
         <li><strong>Full Snapshot (Batch):</strong> Performs an initial `SELECT *` dump. Best for static lookup tables or slowly changing dimensions (SCD Type 1).</li>
         <li><strong>Incremental (Cursor/Watermark):</strong> Tracks state (e.g., `updated_at &gt; '2026-03-21'`) to only pull newly modified records, saving compute costs drastically.</li>
         <li><strong>Log-Based CDC (Streaming):</strong> Subscribes directly to the Write-Ahead Log (WAL) of the origin database. Replicates strict ACID transactions in sub-second time without querying the main table.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mb-4">Destinations (Sinks)</h2>
      <p className="text-[#94a3b8] mb-6 leading-relaxed">
        Our architecture defaults to Delta Lake / Apache Iceberg standard formats. You can effortlessly sink transformed data into:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
         {['Snowflake', 'Databricks', 'BigQuery', 'Redshift', 'DuckDB', 'AWS S3', 'PostgreSQL', 'Redis'].map(provider => (
           <div key={provider} className="flex items-center justify-center p-4 bg-[#111827] border border-[#1e293b] rounded-lg font-semibold text-[#94a3b8]">
              {provider}
           </div>
         ))}
      </div>
    </div>
  );
}
