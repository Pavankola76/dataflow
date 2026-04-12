"use client";

import React, { useState } from "react";
import { Plus, CheckCircle2, AlertTriangle, FileCheck, Clock } from "lucide-react";

export default function ContractsPage() {
  const summaryStats = [
    { label: "Active Contracts", value: "3", color: "var(--c-blue)", icon: FileCheck },
    { label: "Total Checks", value: "61", color: "var(--c-green)", icon: CheckCircle2 },
    { label: "Violations", value: "3", color: "var(--c-red)", icon: AlertTriangle },
    { label: "Avg. Check Time", value: "< 2s", color: "var(--c-purple)", icon: Clock },
  ];
  const contracts = [
    { name: "fact_orders", schemas: 12, checks: 8, mode: "block", violations: 0, lastChecked: "Checked 10 min ago" },
    { name: "dim_customers", schemas: 8, checks: 5, mode: "warn", violations: 2, lastChecked: "Checked 1 hour ago" },
    { name: "stg_products", schemas: 6, checks: 3, mode: "log", violations: 0, lastChecked: "Never" },
    { name: "dim_dates", schemas: 15, checks: 4, mode: "warn", violations: 1, lastChecked: "Checked 30 min ago" },
  ];
  const [tab, setTab] = useState<"All" | "Active" | "Violated">("All");
  const modeConfig: Record<string, { color: string; bg: string }> = {
    block: { color: "var(--c-red)", bg: "var(--c-red-bg)" },
    warn:  { color: "var(--c-amber)", bg: "var(--c-amber-bg)" },
    log:   { color: "var(--c-blue)", bg: "var(--c-blue-bg)" },
  };

  const filtered = tab === "Violated" ? contracts.filter(c => c.violations > 0) : contracts;

  return (
    <div className="page-content animate-in">
      <div className="page-header">
        <div><h1 className="page-title">Data Contracts</h1><p className="page-subtitle">Define and enforce schema, quality, and freshness guarantees.</p></div>
        <button className="btn-primary-console"><Plus size={14} />New Contract</button>
      </div>

      <div className="stats-grid">
        {summaryStats.map((s) => (
          <div key={s.label} className="stat-card stat-card--compact">
            <div className="stat-card-icon" style={{ background: `${s.color}15`, color: s.color }}><s.icon size={16} strokeWidth={2} /></div>
            <div><div className="stat-card-label">{s.label}</div><div className="stat-card-value stat-card-value--sm">{s.value}</div></div>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="section-card-header">
          <div className="tab-bar">
            {(["All", "Active", "Violated"] as const).map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? "tab-btn--active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="contract-list">
          {filtered.map((c) => {
            const mc = modeConfig[c.mode] || modeConfig.log;
            return (
              <div key={c.name} className="contract-item">
                <div className="contract-item-left">
                  <div className={`contract-dot ${c.violations > 0 ? "contract-dot--warn" : "contract-dot--ok"}`} />
                  <div>
                    <div className="contract-name">{c.name}</div>
                    <div className="contract-meta">{c.schemas} schema · {c.checks} quality checks · Mode: <span className="mode-pill" style={{ color: mc.color, background: mc.bg }}>{c.mode}</span></div>
                  </div>
                </div>
                <div className="contract-item-right">
                  {c.violations > 0 && (
                    <span className="violation-badge"><AlertTriangle size={12} />{c.violations} violation{c.violations > 1 ? "s" : ""}</span>
                  )}
                  <span className="contract-checked">{c.lastChecked}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
