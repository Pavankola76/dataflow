"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Book, Settings, Command, Cloud, Shield, Database, 
  Workflow, Check, Bot, Layers, Zap, Rocket,
  BookOpen, Code, Cpu, Cable, AlignLeft, BarChart3, ChevronRight, X, ArrowLeft
} from "lucide-react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    {
      title: "Getting Started",
      items: [
        { name: "Introduction", href: "/docs", icon: Book },
        { name: "Quickstart Guide", href: "/docs/quickstart", icon: Zap },
        { name: "Medallion Architecture", href: "/docs/architecture", icon: Layers },
      ]
    },
    {
      title: "Core Services",
      items: [
        { name: "Connectors (Sources/Sinks)", href: "/docs/services/connectors", icon: Cable },
        { name: "Data Pipelines (ETL)", href: "/docs/services/pipelines", icon: Workflow },
        { name: "Data Catalog & Governance", href: "/docs/services/catalog", icon: Shield },
        { name: "AI Auto-Healing & Copilot", href: "/docs/services/copilot", icon: Bot },
        { name: "Observability & Quality", href: "/docs/services/observability", icon: BarChart3 },
      ]
    },
    {
      title: "Comprehensive Tutorials",
      items: [
        { name: "E-Commerce Pipeline (End-to-End)", href: "/docs/tutorials/ecommerce", icon: Rocket },
        { name: "Real-Time Fraud Detection", href: "/docs/tutorials/fraud", icon: Shield },
        { name: "FinOps Cost Optimization", href: "/docs/tutorials/finops", icon: BarChart3 },
      ]
    },
    {
      title: "Cloud Deployment",
      items: [
        { name: "Deploying to AWS", href: "/docs/cloud/aws", icon: Cloud },
        { name: "Deploying to GCP", href: "/docs/cloud/gcp", icon: Cloud },
        { name: "Deploying to Azure", href: "/docs/cloud/azure", icon: Cloud },
        { name: "VPC & Private Link", href: "/docs/cloud/vpc", icon: Shield },
        { name: "Scaling Infrastructure", href: "/docs/cloud/scaling", icon: Cpu },
      ]
    },
    {
      title: "Platform Configuration",
      items: [
        { name: "Role-Based Access (RBAC)", href: "/docs/config/rbac", icon: Shield },
        { name: "Managing Workspaces", href: "/docs/config/workspaces", icon: Settings },
        { name: "Billing & Subscriptions", href: "/docs/config/billing", icon: Settings },
        { name: "SAML/SSO Integration", href: "/docs/config/sso", icon: Shield },
      ]
    },
    {
      title: "API & SDK Reference",
      items: [
        { name: "REST API Reference", href: "/docs/api/rest", icon: Code },
        { name: "Python SDK Hooks", href: "/docs/api/python", icon: Code },
        { name: "TypeScript Client", href: "/docs/api/typescript", icon: Code },
      ]
    },
    {
      title: "Advanced Data Engineering",
      items: [
        { name: "Writing Custom dbt Models", href: "/docs/advanced/dbt", icon: Database },
        { name: "PySpark Performance Tuning", href: "/docs/advanced/pyspark", icon: Zap },
        { name: "Handling Schema Drift", href: "/docs/advanced/schema-drift", icon: AlignLeft },
        { name: "Backfilling Historical Data", href: "/docs/advanced/backfills", icon: Database },
        { name: "Data Contracts Strictness", href: "/docs/advanced/contracts", icon: Check },
        { name: "Custom Great Expectations", href: "/docs/advanced/dq", icon: Shield },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#0a0c10] text-[#e2e8f0] font-sans">
      {/* Sidebar Navigation */}
      <aside className={`w-72 bg-[#111827] border-r border-[#1e293b] flex-shrink-0 flex flex-col overflow-y-auto ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-[#1e293b] sticky top-0 bg-[#111827] z-10 flex items-center gap-2">
           <Database size={16} className="text-[#3b82f6]"/>
           <span className="font-bold text-white tracking-wide">DataFlow Docs</span>
        </div>
        
        <div className="px-4 pt-4">
           <Link href="/" className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors bg-[#1e293b]/50 p-2 rounded-md hover:bg-[#1e293b]">
             <ArrowLeft size={14} /> Back to Main App
           </Link>
        </div>
        
        <nav className="p-4 space-y-8 flex-1">
          {navigation.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1.5">
                {section.items.map((item, iDx) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={iDx}>
                      <Link 
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${isActive ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-medium' : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b]'}`}
                      >
                        <item.icon size={14} className={isActive ? 'text-[#3b82f6]' : 'text-[#64748b]'} />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0a0c10]">
        <div className="md:hidden p-4 border-b border-[#1e293b] flex justify-between items-center bg-[#111827]">
           <div className="flex items-center gap-2">
              <Database size={16} className="text-[#3b82f6]"/>
              <span className="font-bold text-white">Docs</span>
           </div>
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-[#1e293b] rounded text-[#94a3b8] hover:text-white transition-colors">
             {mobileMenuOpen ? <X size={16} /> : <BookOpen size={16} />}
           </button>
        </div>
        
        <div className="max-w-4xl mx-auto p-8 lg:p-12 pb-24">
          <div className="prose prose-invert prose-blue max-w-none">
            {children}
          </div>
          
          <div className="mt-16 pt-8 border-t border-[#1e293b] flex justify-between items-center">
             <Link href="/" className="text-sm text-[#94a3b8] hover:text-white transition-colors">
                ← Back to Main App
             </Link>
             <p className="text-sm text-[#64748b]">© 2026 DataFlow AI Docs</p>
          </div>
        </div>
      </main>
    </div>
  );
}
