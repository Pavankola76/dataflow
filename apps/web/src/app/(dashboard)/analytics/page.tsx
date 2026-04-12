"use client";

import React from "react";
import { QueryChat } from "@/components/analytics/QueryChat";

export default function AnalyticsDashboard() {
  return (
    <div className="page-content animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="page-title">Analytics Engine</h1>
          <p className="page-subtitle">Query your data warehouse in plain English. No SQL required.</p>
        </div>
      </div>
      <div className="section-card" style={{ flex: 1, minHeight: 0, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <QueryChat />
      </div>
    </div>
  );
}
