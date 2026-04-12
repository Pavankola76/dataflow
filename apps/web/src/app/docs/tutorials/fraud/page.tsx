"use client";
import React from "react";
import { Shield, ChevronRight, Activity } from "lucide-react";

export default function GenericDocPage() {
  return (
    <div className="text-[#e2e8f0]">
      <div className="flex items-center gap-2 text-sm text-[#3b82f6] font-semibold mb-6 uppercase tracking-wider">
         <span>Tutorials</span>
         <ChevronRight size={14} />
         <span className="text-[#94a3b8]">Real-Time Fraud Detection</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-4">
         <span className="bg-[#1e293b] p-3 rounded-xl border border-[#3b82f6]/30">
            <Shield size={32} className="text-[#3b82f6]" />
         </span>
         Real-Time Fraud Detection
      </h1>
      <p className="text-xl text-[#94a3b8] mb-10 leading-relaxed border-b border-[#1e293b] pb-8">
        A complete tutorial on using Flink and Kafka to detect credit card fraud anomalies within 50ms, before sinking the flagged events to PostgreSQL.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">The Stateful Streaming Challenge</h2>
      <p className="text-[#cbd5e1] mb-6 leading-relaxed">
        Fraud detection cannot occur in nightly batch Spark loads. If a compromised card is swiped consecutively across three continents within a 4-minute array, the processing must happen instantaneously. This tutorial outlines how DataFlow AI orchestrates stateful Apache Flink streams visually.
      </p>

      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-lg mb-8">
         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-[#ef4444]" /> Step-by-Step Logic Assembly</h3>
         <ol className="list-decimal pl-5 space-y-4 text-sm text-[#cbd5e1]">
            <li><strong>The Source:</strong> We attach a Kafka topic `financial_transactions` streaming 30,000 JSON events per second into our Bronze layer.</li>
            <li><strong>Tumbling Windows:</strong> We drag a Window Aggregation node onto the Canvas, configuring a 5-minute Tumbling Window grouped by `credit_card_hash`. The AI Copilot translates this automatically to Flink&apos;s time-windowed Watermark syntax.</li>
            <li><strong>Outlier Identification:</strong> We implement a secondary Map node utilizing an IF-statement. If the Tumbling Window recognizes &gt;$5,000 processed within a 5-minute span geographically dispersed by &gt;1,000 miles, the internal transaction `fraud_flag` mathematically resolves to TRUE.</li>
            <li><strong>Low-Latency Sink:</strong> The resultant flagged schema is routed instantly to an AWS Aurora setup via a JDBC Connector, allowing internal Banking application logic to deny the transaction in effectively real-time.</li>
         </ol>
      </div>
    </div>
  );
}
