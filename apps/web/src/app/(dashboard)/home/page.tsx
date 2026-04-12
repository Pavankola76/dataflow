"use client";

import React, { useEffect, useState } from "react";
import { 
  GitBranch, Layers, Activity, ShieldCheck, Zap, Sparkles, BookOpen, 
  ExternalLink, TrendingUp, ChevronRight, ArrowUpRight, Clock, RefreshCw, Loader2
} from "lucide-react";
import { useAuthStore } from "@/stores";

const API = "http://localhost:8000/api/v1";

interface HealthData {
  active_pipelines: number;
  rows_processed_24h: string;
  failing_contracts: number;
  avg_latency_ms: number;
  status: string;
}

interface PipelineRun {
  id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  rows_processed: number;
  pipeline_id: string;
}

export default function OverviewPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      
      const fetchOpts = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [healthRes, monitorRes] = await Promise.all([
          fetch(`${API}/observability/health`, fetchOpts),
          fetch(`${API}/monitoring/summary`, fetchOpts),
        ]);
        
        if (healthRes.ok) {
          const hData = await healthRes.json();
          setHealth(hData);
        }
        
        if (monitorRes.ok) {
          const mData = await monitorRes.json();
          if (mData.recent_runs) {
            setRuns(mData.recent_runs.slice(0, 5));
          }
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const stats: Array<{label: string, value: string, sub: string, icon: any, trend: string | null, color: string}> = [
    { 
      label: "Active Pipelines", 
      value: health ? String(health.active_pipelines) : "—", 
      sub: "Connected to backend", 
      icon: GitBranch, 
      trend: null, 
      color: "var(--c-blue)" 
    },
    { 
      label: "Rows Processed (24h)", 
      value: health ? Number(health.rows_processed_24h).toLocaleString() : "—", 
      sub: "Across all pipeline runs", 
      icon: Layers, 
      trend: null, 
      color: "var(--c-purple)" 
    },
    { 
      label: "Platform Status", 
      value: health ? health.status : "—", 
      sub: health?.avg_latency_ms ? `Avg latency: ${health.avg_latency_ms}ms` : "Checking...", 
      icon: Activity, 
      trend: null, 
      color: "var(--c-green)" 
    },
    { 
      label: "Failing Contracts", 
      value: health ? String(health.failing_contracts) : "—", 
      sub: "Data quality violations", 
      icon: ShieldCheck, 
      trend: null, 
      color: "var(--c-amber)" 
    },
  ];

  const services = [
    { icon: Zap, title: "Serverless Spark", desc: "Run massive analytical workloads without managing infrastructure. Scales to petabytes.", tag: "Compute" },
    { icon: Activity, title: "Real-Time Streams", desc: "Ingest hundreds of thousands of events/sec with sub-ms latency. Fully managed Kafka.", tag: "Streaming" },
    { icon: Sparkles, title: "Agentic Healer", desc: "Automatically detect schema drifts and bad data. Fixes transformation pipelines on the fly.", tag: "AI" },
    { icon: BookOpen, title: "Unified Catalog", desc: "A single control plane to search, discover, and trace data lineage across all systems.", tag: "Governance" },
  ];

  // Build activity logs from real pipeline runs
  const logs = runs.length > 0 
    ? runs.map(run => {
        const status = run.status === "succeeded" ? "success" : run.status === "failed" ? "warning" : "info";
        const timeAgo = run.completed_at 
          ? getRelativeTime(run.completed_at) 
          : run.started_at 
            ? getRelativeTime(run.started_at)
            : "just now";
        const text = run.status === "succeeded"
          ? `Pipeline run completed — ${run.rows_processed?.toLocaleString() || 0} rows`
          : run.status === "failed"
            ? `Pipeline run failed`
            : `Pipeline run ${run.status}`;
        return { status, text, time: timeAgo };
      })
    : [
        { status: "info", text: "No recent pipeline runs found", time: "—" },
      ];

  return (
    <div className="page-content animate-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Console Home</h1>
          <p className="page-subtitle">Monitor infrastructure health, manage deployments, and review active alerts.</p>
        </div>
        <button className="btn-primary-console" onClick={() => window.location.reload()}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: `${s.color}15`, color: s.color }}>
                <s.icon size={16} strokeWidth={2} />
              </div>
              {s.trend && (
                <span className={`stat-trend ${s.trend.startsWith("+") ? "stat-trend--up" : "stat-trend--down"}`}>
                  <TrendingUp size={12} />
                  {s.trend}
                </span>
              )}
            </div>
            <div className="stat-card-value">{loading ? "…" : s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="two-col">
        {/* Featured Compute Services */}
        <div className="col-main">
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">Featured Compute Services</h2>
              <button className="btn-ghost-sm">View all <ChevronRight size={13} /></button>
            </div>
            <div className="services-grid">
              {services.map((s) => (
                <div key={s.title} className="service-card">
                  <div className="service-card-top">
                    <div className="service-icon"><s.icon size={18} strokeWidth={1.8} /></div>
                    <span className="service-tag">{s.tag}</span>
                  </div>
                  <h3 className="service-title">{s.title}</h3>
                  <p className="service-desc">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Banner Cards */}
            <div className="banner-row">
              <div className="banner-card banner-card--blue">
                <div className="banner-card-icon"><Sparkles size={20} /></div>
                <div>
                  <div className="banner-card-title">What's new</div>
                  <div className="banner-card-desc">Silver/Gold transformations, Data Quality gates, CRON scheduling now live.</div>
                  <a href="#" className="banner-card-link">View changelog <ArrowUpRight size={12} /></a>
                </div>
              </div>
              <div className={`banner-card ${health?.status === "Healthy" ? "banner-card--green" : "banner-card--blue"}`}>
                <div className="banner-card-icon"><Activity size={20} /></div>
                <div>
                  <div className="banner-card-title">Platform Status: {health?.status || "Loading..."}</div>
                  <div className="banner-card-desc">
                    {health ? `${health.active_pipelines} pipelines active • ${Number(health.rows_processed_24h).toLocaleString()} rows in 24h` : "Connecting to backend..."}
                  </div>
                  <a href="/monitoring" className="banner-card-link">View monitoring <ArrowUpRight size={12} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="col-aside">
          <div className="section-card">
            <div className="section-card-header">
              <h2 className="section-card-title">Recent Activity</h2>
              <button className="btn-icon-sm" onClick={() => window.location.reload()}><RefreshCw size={13} /></button>
            </div>
            <div className="activity-list">
              {logs.map((log, i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot activity-dot--${log.status}`} />
                  <div className="activity-body">
                    <div className="activity-text">{log.text}</div>
                    <div className="activity-time"><Clock size={11} /> {log.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <a href="/pipelines" className="activity-viewall">View all pipelines <ChevronRight size={13} /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
