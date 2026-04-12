"use client";

import React, { useState, useEffect } from "react";
import { 
  HardDrive, Database, Cloud, Warehouse, Activity, Globe, Plus, ArrowUpRight, MoreHorizontal, Server, Sparkles, X, CheckCircle2, Zap, Loader2, Table, Link2, Trash2
} from "lucide-react";
import { useAuthStore } from "@/stores";

const API = "http://localhost:8000/api/v1";

interface Connection {
  id: string;
  name: string;
  connector_type: string;
  status: string;
  config: any;
  created_at: string;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const featured = [
    // Operational DB
    { icon: Database, name: "PostgreSQL", desc: "Connect to any PostgreSQL database.", category: "Operational DB", id: "postgresql" },
    { icon: Database, name: "MySQL / MariaDB", desc: "Connect to MySQL or MariaDB instances.", category: "Operational DB", id: "mysql" },
    { icon: Database, name: "Microsoft SQL Server", desc: "Connect to on-premise or cloud SQL Server.", category: "Operational DB", id: "sqlserver" },
    { icon: Database, name: "Oracle Database", desc: "Enterprise-grade relational database connector.", category: "Operational DB", id: "oracle" },
    { icon: Database, name: "MongoDB", desc: "NoSQL document database connector for semi-structured data.", category: "Operational DB", id: "mongodb" },
    
    // Warehouse
    { icon: Cloud, name: "Snowflake", desc: "Cloud-native data warehouse for robust analytics.", category: "Warehouse", id: "snowflake" },
    { icon: Cloud, name: "Google BigQuery", desc: "Serverless, highly scalable enterprise data warehouse.", category: "Warehouse", id: "bigquery" },
    { icon: Warehouse, name: "Amazon Redshift", desc: "Fast, scalable, cost-effective data warehousing.", category: "Warehouse", id: "redshift" },
    
    // Object Storage
    { icon: HardDrive, name: "Amazon S3", desc: "Read and write data directly from object storage.", category: "Object Storage", id: "s3" },
    
    // Streaming
    { icon: Activity, name: "Apache Kafka", desc: "Real-time streaming event data integration.", category: "Streaming", id: "kafka" },
    
    // SaaS Application
    { icon: Globe, name: "Salesforce CRM", desc: "Ingest your CRM data automatically into your warehouse.", category: "SaaS Application", id: "salesforce" },
    { icon: Globe, name: "Stripe", desc: "Automate financial data and billing transaction ingestion.", category: "SaaS Application", id: "stripe" },
  ];

  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("All");

  const [formName, setFormName] = useState("");
  const [formHost, setFormHost] = useState("");
  const [formPort, setFormPort] = useState("");
  const [formDatabase, setFormDatabase] = useState("");
  const [formUser, setFormUser] = useState("");
  const [formPass, setFormPass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) fetchConnections();
  }, [token]);

  const fetchConnections = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/connections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConnections(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch connections", e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ["All", "Operational DB", "Warehouse", "Object Storage", "Streaming", "SaaS Application"];
  const filteredProducts = featured.filter(p => activeTab === "All" || p.category === activeTab);

  const openWizard = (product: any) => {
    setSelectedProduct(product);
    setFormName(`${product.name} Connection`);
    setFormHost(product.id === "postgresql" ? "localhost" : "");
    setFormPort(product.id === "postgresql" ? "5432" : "");
    setFormDatabase("");
    setFormUser("");
    setFormPass("");
    setWizardOpen(true);
  };

  const handleCreateConnection = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formName,
        connector_type: selectedProduct.id,
        config: {
          host: formHost,
          port: parseInt(formPort) || 5432,
          database: formDatabase,
          username: formUser,
          password: formPass
        }
      };

      const res = await fetch(`${API}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setWizardOpen(false);
        fetchConnections();
      } else {
        alert("Failed to create connection");
      }
    } catch (e) {
      alert("Error: " + e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this connection?")) return;
    try {
      await fetch(`${API}/connections/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConnections();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content animate-in relative flex flex-col min-h-screen pb-12">
      {/* Page Header */}
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Connections</h1>
          <p className="page-subtitle">Manage your active data sources and destinations.</p>
        </div>
        <button className="btn-primary-console" onClick={() => {
           // Find postgres and open it by default since it's the main one
           openWizard(featured[0]);
        }}>
          <Plus size={14} />
          New Connection
        </button>
      </div>

      {/* Active Connections List */}
      <div className="mb-10">
        <h2 className="text-[14px] font-semibold text-white mb-4 flex items-center gap-2">
          <Link2 size={16} className="text-blue-400" />
          Active Connections
        </h2>
        
        {loading ? (
           <div className="flex items-center gap-2 text-zinc-500 py-6 border border-zinc-800 rounded bg-zinc-900/30 px-6">
             <Loader2 size={16} className="animate-spin" /> Loading connections...
           </div>
        ) : connections.length === 0 ? (
           <div className="text-zinc-500 py-6 border border-zinc-800 border-dashed rounded bg-zinc-900/10 px-6 text-[13px]">
             No active connections found. Create one from the catalog below.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map(c => {
               const prod = featured.find(f => f.id === c.connector_type) || featured[0];
               const Icon = prod.icon;
               return (
                 <div key={c.id} className="relative group bg-[var(--bg-card)] border border-[var(--b2)] hover:border-blue-500/50 rounded-lg p-5 transition-all">
                    <div className="flex justify-between items-start mb-3">
                       <div className="w-10 h-10 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <Icon size={20} />
                       </div>
                       <button 
                         onClick={(e) => handleDelete(c.id, e)}
                         className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                    <h3 className="font-semibold text-zinc-100 text-[15px] mb-1 truncate" title={c.name}>{c.name}</h3>
                    <div className="flex items-center gap-2 text-[12px] text-zinc-500 uppercase tracking-wider font-mono mt-2">
                       <span className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                         <CheckCircle2 size={10} /> Active
                       </span>
                       • {c.connector_type}
                    </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-[var(--b2)] my-8"></div>

      {/* Catalog */}
      <h2 className="text-[14px] font-semibold text-white mb-4">Connector Catalog</h2>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 hidden-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-[13px] font-semibold transition-colors whitespace-nowrap border ${
                activeTab === tab 
                  ? 'bg-[var(--c-blue-bg)] border-[var(--c-blue)] text-[var(--c-blue)]' 
                  : 'bg-[var(--bg-surface)] border-[var(--b2)] text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--bg-muted)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((p) => (
          <div key={p.name} className="product-card">
            <div className="product-card-header">
              <div className="product-icon"><p.icon size={20} strokeWidth={1.6} /></div>
              <span className="product-tag">{p.category}</span>
            </div>
            <h3 className="product-name">{p.name}</h3>
            <p className="product-desc">{p.desc}</p>
            <button className="product-connect" onClick={() => openWizard(p)}>
              Connect <ArrowUpRight size={12} />
            </button>
          </div>
        ))}
      </div>

      {wizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg section-card shadow-[0_12px_48px_rgba(0,0,0,0.5)] border border-[var(--b3)] overflow-hidden relative" style={{ background: 'var(--bg-elevated)', padding: 0 }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--b2)] bg-[var(--bg-card)]">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-3">
                <selectedProduct.icon size={18} className="text-blue-500" />
                Connect to {selectedProduct?.name}
              </h2>
              <button onClick={() => setWizardOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              
              {selectedProduct?.id !== 'postgresql' ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-md text-[13px] mb-4">
                   <strong>Note:</strong> In this demo environment, only PostgreSQL connections are fully supported for extraction. You can save this connection metadata, but extraction may fail.
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--t2)] mb-1.5 uppercase tracking-wider">Connection Name</label>
                  <input id="conn-name" type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[var(--b2)] bg-[var(--bg-card)] text-white rounded focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[12px] font-semibold text-[var(--t2)] mb-1.5 uppercase tracking-wider">Host</label>
                    <input id="conn-host" type="text" value={formHost} onChange={e => setFormHost(e.target.value)} placeholder="e.g. localhost or rds.aws.com" className="w-full px-3 py-2 text-[13px] border border-[var(--b2)] bg-[var(--bg-card)] text-white rounded focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--t2)] mb-1.5 uppercase tracking-wider">Port</label>
                    <input id="conn-port" type="text" value={formPort} onChange={e => setFormPort(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[var(--b2)] bg-[var(--bg-card)] text-white rounded focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--t2)] mb-1.5 uppercase tracking-wider">Database Name</label>
                  <input id="conn-db" type="text" value={formDatabase} onChange={e => setFormDatabase(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[var(--b2)] bg-[var(--bg-card)] text-white rounded focus:border-blue-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--t2)] mb-1.5 uppercase tracking-wider">Username</label>
                    <input id="conn-user" type="text" value={formUser} onChange={e => setFormUser(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[var(--b2)] bg-[var(--bg-card)] text-white rounded focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[var(--t2)] mb-1.5 uppercase tracking-wider">Password</label>
                    <input id="conn-pass" type="password" value={formPass} onChange={e => setFormPass(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-[var(--b2)] bg-[var(--bg-card)] text-white rounded focus:border-blue-500 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--b2)] bg-[var(--bg-card)] flex justify-end gap-3">
               <button className="px-4 py-2 text-[13px] text-zinc-300 hover:text-white" onClick={() => setWizardOpen(false)}>
                 Cancel
               </button>
               <button 
                 className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-[13px] font-medium flex items-center gap-2 disabled:opacity-50" 
                 onClick={handleCreateConnection}
                 disabled={isSubmitting}
               >
                 {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                 {isSubmitting ? "Creating..." : "Save Connection"}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
