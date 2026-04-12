"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Database,
  ArrowRight,
  Workflow,
  Shield,
  BarChart3,
  Bot,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Play,
  Layers,
  GitBranch,
  Server,
  BookOpen,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */
import GuidedTour from "../components/demo/GuidedTour";

export default function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [stats, setStats] = useState({
    pipeline_uptime: 99.9,
    pipelines_deployed: 500,
    faster_development: 10,
    cost_reduction: 50
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/system/public/stats`)
      .then(res => res.json())
      .then(data => {
        if (data && data.pipeline_uptime !== undefined) {
          setStats(data);
        }
      })
      .catch(err => console.error("Failed to load public stats", err));
  }, []);

  const stat1 = useCounter(stats.pipeline_uptime, 1800);
  const stat2 = useCounter(stats.pipelines_deployed, 2000);
  const stat3 = useCounter(stats.faster_development, 1500);
  const stat4 = useCounter(stats.cost_reduction, 1700);

  const capabilities = [
    {
      icon: Workflow,
      title: "AI Pipeline Builder",
      desc: "Describe your data flow in plain English. Our AI agent writes the SQL, builds the DAG, and deploys — zero boilerplate.",
      tag: "Core",
      href: "/pipelines",
    },
    {
      icon: Shield,
      title: "Self-Healing Pipelines",
      desc: "Automatic schema drift detection, root-cause analysis, and one-click AI-generated patches keep data flowing 24/7.",
      tag: "Reliability",
      href: "/monitoring",
    },
    {
      icon: BarChart3,
      title: "Natural Language Analytics",
      desc: "Ask questions in plain English. Get instant SQL, interactive visualizations, and actionable insights in seconds.",
      tag: "Analytics",
      href: "/analytics",
    },
    {
      icon: Bot,
      title: "Data Governance Agent",
      desc: "Automated PII detection, data contracts, SLA monitoring, and comprehensive column-level lineage out of the box.",
      tag: "Governance",
      href: "/catalog",
    },
    {
      icon: GitBranch,
      title: "Version-Controlled Pipelines",
      desc: "Full Git integration with branch-level preview environments. Review, diff, and roll back any pipeline change instantly.",
      tag: "DevOps",
      href: "/models",
    },
    {
      icon: Server,
      title: "Multi-Cloud Deployment",
      desc: "Deploy to Azure, AWS, or GCP with unified orchestration. One control plane for all your data infrastructure.",
      tag: "Infrastructure",
      href: "/connections",
    },
  ];

  return (
    <div className="landing-root">
      {/* ============================================================ */}
      {/*  NAVIGATION                                                   */}
      {/* ============================================================ */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">
            <div className="nav-logo">
              <Database size={16} strokeWidth={2.5} />
            </div>
            <span className="nav-wordmark">
              DataFlow <span className="nav-wordmark-ai">AI</span>
            </span>
          </Link>

          <div className="nav-links">
            <Link href="/home" className="nav-link">
              Dashboard
            </Link>
            <Link href="/connections" className="nav-link">
              Connectors
            </Link>
            <Link href="/pipelines" className="nav-link">
              Pipelines
            </Link>
            <Link href="/analytics" className="nav-link">
              Analytics
            </Link>
            <Link href="/docs" className="nav-link font-bold text-[#3b82f6]">
              Docs
            </Link>
          </div>

          <div className="nav-actions">
            <Link href="/login" className="nav-signin">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary-nav">
              Start free
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                         */}
      {/* ============================================================ */}
      <header className="hero">
        {/* Background mesh */}
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-grid" />
        </div>

        <div className="hero-inner">
          <div className="hero-badge">
            <Zap size={12} />
            <span>Now Generally Available — v3.0</span>
            <ChevronRight size={12} />
          </div>

          <h1 className="hero-title">
            The AI-Native
            <br />
            <span className="hero-title-accent">Data Engineering</span> Platform
          </h1>

          <p className="hero-subtitle">
            Connect any source, let AI build your pipelines, query data in plain
            English, and never worry about broken data flows again — all from a
            single, enterprise-grade control plane.
          </p>

          <div className="hero-ctas">
            <Link href="/register" className="btn-hero-primary">
              <span>Get started free</span>
              <ArrowRight size={16} />
            </Link>
            <button onClick={() => setIsDemoOpen(true)} className="btn-hero-secondary" style={{ cursor: "pointer" }}>
              <Play size={14} />
              <span>Watch demo</span>
            </button>
          </div>

          {/* Trust logos */}
          <div className="hero-trust">
            <span className="hero-trust-label">
              Trusted by data teams at
            </span>
            <div className="hero-trust-logos">
              {["Fortune 500", "Series A–D", "Gov & Public Sector"].map(
                (label) => (
                  <div key={label} className="hero-trust-pill">
                    <Globe size={13} />
                    <span>{label}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  STATS BAR                                                    */}
      {/* ============================================================ */}
      <section className="stats-bar">
        <div className="stats-inner">
          {[
            { ref: stat1.ref, value: stat1.count, suffix: "%", label: "Pipeline Uptime SLA" },
            { ref: stat2.ref, value: stat2.count, suffix: " Active", label: "Pipelines Deployed" },
            { ref: stat3.ref, value: stat3.count, suffix: "x", label: "Faster Development" },
            { ref: stat4.ref, value: stat4.count, suffix: "%", label: "Cost Reduction" },
          ].map((s, i) => (
            <div key={i} className="stat-item" ref={s.ref}>
              <span className="stat-value">
                {s.value}
                {s.suffix}
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CAPABILITIES                                                 */}
      {/* ============================================================ */}
      <section className="section capabilities-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">Capabilities</span>
            <h2 className="section-title">
              Everything your data team needs.
              <br />
              Nothing it doesn&rsquo;t.
            </h2>
            <p className="section-desc">
              A comprehensive, enterprise-grade suite for the modern data stack
              — powered entirely by intelligent agents.
            </p>
          </div>

          <div className="cap-grid">
            {capabilities.map((c) => (
              <div key={c.title} className="cap-card">
                <div className="cap-card-top">
                  <div className="cap-icon-wrap">
                    <c.icon size={20} strokeWidth={1.8} />
                  </div>
                  <span className="cap-tag">{c.tag}</span>
                </div>
                <h3 className="cap-title">{c.title}</h3>
                <p className="cap-desc">{c.desc}</p>
                <Link href={c.href} className="cap-link">
                  Open Tool <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  DOCUMENTATION & LEARNING                                     */}
      {/* ============================================================ */}
      <section className="section docs-section bg-[#0f172a] border-y border-[#1e293b]">
        <div className="section-inner">
          <div className="section-header text-center">
            <span className="section-eyebrow text-[#3b82f6]">Explore the Platform</span>
            <h2 className="section-title">
              Comprehensive Documentation
            </h2>
            <p className="section-desc max-w-2xl mx-auto">
              Master the DataFlow AI ecosystem through our extensive 50+ page technical documentation, covering infrastructure, AI services, and real-world project tutorials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/docs/tutorials/ecommerce" className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#3b82f6] transition-all group">
               <Layers className="text-[#3b82f6] mb-4 group-hover:scale-110 transition-transform" size={32} />
               <h3 className="text-white font-bold text-lg mb-2">Build an E-Commerce Engine</h3>
               <p className="text-[#94a3b8] text-sm mb-4">A complete end-to-end tutorial demonstrating PostgreSQL CDC, Flink Streaming, and Snowflake Sink configurations.</p>
               <span className="text-[#3b82f6] text-sm font-semibold flex items-center gap-1">Start Tutorial <ChevronRight size={14} /></span>
            </Link>
            <Link href="/docs/services/pipelines" className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#10b981] transition-all group">
               <Workflow className="text-[#10b981] mb-4 group-hover:scale-110 transition-transform" size={32} />
               <h3 className="text-white font-bold text-lg mb-2">Automated Data Pipelines</h3>
               <p className="text-[#94a3b8] text-sm mb-4">Deep dive into deploying Spark & Flink clusters mathematically via our Canvas or completely autonomously via LLMs.</p>
               <span className="text-[#10b981] text-sm font-semibold flex items-center gap-1">Read the Docs <ChevronRight size={14} /></span>
            </Link>
            <Link href="/docs" className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#f59e0b] transition-all group lg:col-span-1 md:col-span-2">
               <BookOpen className="text-[#f59e0b] mb-4 group-hover:scale-110 transition-transform" size={32} />
               <h3 className="text-white font-bold text-lg mb-2">Browse All 50+ Topics</h3>
               <p className="text-[#94a3b8] text-sm mb-4">From RBAC configurations and Cloud VPC setup to Custom PySpark fine-tuning—find everything you need.</p>
               <span className="text-[#f59e0b] text-sm font-semibold flex items-center gap-1">View Documentation <ChevronRight size={14} /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TERMINAL / DEMO                                              */}
      {/* ============================================================ */}
      <section className="section terminal-section">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">See it in action</span>
            <h2 className="section-title">
              From zero to production pipeline — in seconds
            </h2>
          </div>

          <div className="terminal-window">
            <div className="terminal-titlebar">
              <div className="terminal-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="terminal-tab-label">DataFlow Cloud Shell</span>
            </div>
            <div className="terminal-body">
              <div className="term-line">
                <span className="term-prompt">$</span>
                <span className="term-cmd">dataflow</span>{" "}
                <span className="term-arg">generate</span>{" "}
                <span className="term-flag">--source</span> postgres{" "}
                <span className="term-flag">--target</span> snowflake
              </div>
              <div className="term-line term-muted">
                ⏳ Analyzing schema: public.orders (14 columns)…
              </div>
              <div className="term-line term-muted">
                🔍 Detecting PII: email, phone → masked
              </div>
              <div className="term-line term-muted">
                📦 Generating dbt models + Airflow DAG…
              </div>
              <div className="term-line term-success">
                <CheckCircle2 size={14} className="inline-icon" />
                Pipeline <strong>orders_silver</strong> deployed to production
              </div>
              <div className="term-line term-success">
                <CheckCircle2 size={14} className="inline-icon" />
                Data contract validated — 0 violations
              </div>
              <div className="term-line term-success">
                <CheckCircle2 size={14} className="inline-icon" />
                Monitoring & alerting configured
              </div>
              <div className="term-line term-cursor">
                <span className="term-prompt">$</span>
                <span className="cursor-blink" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECURITY / COMPLIANCE                                        */}
      {/* ============================================================ */}
      <section className="section compliance-section">
        <div className="section-inner">
          <div className="compliance-grid">
            <div className="compliance-text">
              <span className="section-eyebrow">Enterprise-grade security</span>
              <h2 className="section-title" style={{ textAlign: "left" }}>
                Built for regulated industries
              </h2>
              <p className="section-desc" style={{ textAlign: "left", maxWidth: 520 }}>
                SOC 2 Type II certified, HIPAA-eligible, and GDPR-ready.
                Your data never leaves your VPC — we bring the compute to you.
              </p>
              <div className="compliance-badges">
                {["SOC 2", "HIPAA", "GDPR", "ISO 27001"].map((b) => (
                  <div key={b} className="compliance-badge">
                    <Lock size={12} />
                    {b}
                  </div>
                ))}
              </div>
            </div>
            <div className="compliance-visual">
              <div className="compliance-card-stack">
                {[
                  { icon: Shield, label: "End-to-end encryption", sub: "AES-256 at rest, TLS 1.3 in transit" },
                  { icon: Layers, label: "VPC deployment", sub: "Runs inside your private network" },
                  { icon: Lock, label: "Role-based access", sub: "Fine-grained RBAC with SSO/SAML" },
                ].map((item) => (
                  <div key={item.label} className="compliance-card">
                    <div className="compliance-card-icon">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <div className="compliance-card-label">{item.label}</div>
                      <div className="compliance-card-sub">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOTTOM CTA                                                   */}
      {/* ============================================================ */}
      <section className="section cta-section">
        <div className="cta-inner">
          <div className="cta-glow" aria-hidden="true" />
          <h2 className="cta-title">
            Ready to ship data pipelines 10× faster?
          </h2>
          <p className="cta-subtitle">
            Join thousands of data engineers building with DataFlow AI.
            Free tier available — no credit card required.
          </p>
          <div className="cta-actions">
            <Link href="/register" className="btn-hero-primary">
              <span>Create free account</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="#" className="btn-hero-secondary">
              <span>Contact sales</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-brand" style={{ gap: 10 }}>
              <div className="nav-logo">
                <Database size={14} strokeWidth={2.5} />
              </div>
              <span className="nav-wordmark" style={{ fontSize: 15 }}>
                DataFlow <span className="nav-wordmark-ai">AI</span>
              </span>
            </div>
            <p className="footer-tagline">
              The AI-native platform for modern data engineering teams.
            </p>
          </div>
          <div className="footer-links-group">
            {[
              { heading: "Product", links: [{name: "Dashboard", href: "/home"}, {name: "Pipeline Builder", href: "/pipelines"}, {name: "Analytics", href: "/analytics"}, {name: "Governance", href: "/catalog"}] },
              { heading: "Resources", links: [{name: "Documentation", href: "/docs"}, {name: "E-Commerce Tutorial", href: "/docs/tutorials/ecommerce"}, {name: "Connections", href: "/connections"}, {name: "Monitoring", href: "/monitoring"}] },
            ].map((group) => (
              <div key={group.heading} className="footer-col">
                <span className="footer-col-heading">{group.heading}</span>
                {group.links.map((l) => (
                  <Link key={l.name} href={l.href} className="footer-link">
                    {l.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 DataFlow AI, Inc. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Cookie Settings</Link>
          </div>
        </div>
      </footer>

      <GuidedTour isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
