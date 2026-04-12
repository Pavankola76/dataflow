"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Cell, Tooltip as RechartsTooltip } from "recharts";
import { 
  CircleDollarSign, TrendingUp, Sparkles, Server, Zap, PieChart, 
  Activity, AlertCircle, CheckCircle2, FileText, Wrench, X, Loader2
} from "lucide-react";
import { useAuthStore } from "@/stores";

interface CostMetric {
  date: string;
  warehouse_compute: number;
  storage: number;
  data_transfer: number;
  total: number;
}

interface Recommendation {
  id: string;
  type: string;
  impact: string;
  resource: string;
  description: string;
  sql_suggestion?: string;
}

export default function CostOptimizationPage() {
  const [metrics, setMetrics] = useState<CostMetric[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "pipelines" | "users">("overview");

  const { token } = useAuthStore();

  useEffect(() => {
    const fetchCostData = async () => {
      if (!token) return;
      const opts = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [metricsRes, recsRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/cost/metrics", opts),
          fetch("http://localhost:8000/api/v1/cost/recommendations", opts)
        ]);
        const m = await metricsRes.json();
        const r = await recsRes.json();
        setMetrics(Array.isArray(m) ? m : []);
        setRecommendations(Array.isArray(r) ? r : []);
      } catch (err) {
        console.error("Failed to load cost data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCostData();
  }, []);

  const totalSpend = metrics.reduce((acc, m) => acc + m.total, 0);
  const avgDaily = totalSpend / (metrics.length || 1);
  const projectedMonthly = avgDaily * 30;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page-content animate-in h-screen overflow-y-auto">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CircleDollarSign size={20} className="text-[var(--c-amber)]" />
            Cost Optimization
          </h1>
          <p className="page-subtitle">Track warehouse compute expenditure and action AI-generated savings recommendations.</p>
        </div>
        <div className="page-header-actions">
          <div className="bg-[var(--bg-muted)] rounded p-1 flex border border-[var(--b2)]">
            <button className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${activeTab === 'overview' ? 'bg-[var(--bg-card)] text-[var(--t1)] shadow-sm' : 'text-[var(--t3)] hover:text-[var(--t1)]'}`} onClick={() => setActiveTab('overview')}>Overview</button>
            <button className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${activeTab === 'pipelines' ? 'bg-[var(--bg-card)] text-[var(--t1)] shadow-sm' : 'text-[var(--t3)] hover:text-[var(--t1)]'}`} onClick={() => setActiveTab('pipelines')}>Pipelines</button>
            <button className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${activeTab === 'users' ? 'bg-[var(--bg-card)] text-[var(--t1)] shadow-sm' : 'text-[var(--t3)] hover:text-[var(--t1)]'}`} onClick={() => setActiveTab('users')}>Users</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        {/* Left Column: 3 Spans Wide (Charts and Metrics) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* KPI Card 1 */}
            <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[var(--c-amber-bg)] to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <p className="text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Activity size={13} /> Trailing 7-Day Spend
              </p>
              <h3 className="text-3xl font-semibold text-[var(--t1)]">${totalSpend.toFixed(2)}</h3>
              <p className="text-[12px] text-[var(--t2)] mt-2 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[var(--c-red)]" /> <span className="text-[var(--c-red)]">+12.4%</span> vs previous week
              </p>
            </div>
            
            {/* KPI Card 2 */}
            <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg p-5 shadow-sm">
              <p className="text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <PieChart size={13} /> Projected Monthly
              </p>
              <h3 className="text-3xl font-semibold text-[var(--t1)]">${projectedMonthly.toFixed(2)}</h3>
              <p className="text-[12px] text-[var(--t2)] mt-2 flex items-center gap-1.5">
                 Tracking towards 92% of budget
              </p>
            </div>

            {/* KPI Card 3 */}
            <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[var(--c-green-bg)] to-transparent opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <p className="text-[12px] font-medium text-[var(--t3)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles size={13} /> Potential Savings
              </p>
              <h3 className="text-3xl font-semibold text-[var(--c-green)]">$747.00</h3>
              <p className="text-[12px] text-[var(--t2)] mt-2 flex items-center gap-1.5">
                3 active AI recommendations
              </p>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg p-5 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-[15px] font-semibold text-[var(--t1)]">Cost Over Time (USD)</h2>
               <div className="flex items-center gap-4 text-[12px] text-[var(--t2)]">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--c-blue)]"></div>Compute</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--c-indigo)]"></div>Storage</span>
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--c-purple)]"></div>Transfer</span>
               </div>
            </div>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompute" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--c-blue)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--c-blue)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--c-indigo)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--c-indigo)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--b2)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--t3)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--t3)' }} dx={-10} tickFormatter={(v) => `$${v}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--b2)', borderRadius: '6px', fontSize: '13px', color: 'var(--t1)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'var(--t2)' }}
                  />
                  <Area type="monotone" dataKey="warehouse_compute" stackId="1" stroke="var(--c-blue)" strokeWidth={2} fill="url(#colorCompute)" activeDot={{ r: 4, strokeWidth: 0, fill: "var(--c-blue)" }} />
                  <Area type="monotone" dataKey="storage" stackId="1" stroke="var(--c-indigo)" strokeWidth={2} fill="url(#colorStorage)" activeDot={{ r: 4, strokeWidth: 0, fill: "var(--c-indigo)" }} />
                  <Area type="monotone" dataKey="data_transfer" stackId="1" stroke="var(--c-purple)" strokeWidth={2} fill="var(--c-purple)" activeDot={{ r: 4, strokeWidth: 0, fill: "var(--c-purple)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Recommendations panel */}
        <div className="xl:col-span-1 bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg shadow-sm flex flex-col overflow-hidden h-full max-h-[600px]">
           <div className="p-4 border-b border-[var(--b2)] bg-gradient-to-r from-[var(--bg-card)] to-[var(--c-purple-bg)] flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-[14px] font-semibold text-[var(--t1)] flex items-center gap-2">
                   <Sparkles size={16} className="text-[var(--c-purple)]" />
                   Antigravity Optimization
                 </h2>
                 <p className="text-[11px] text-[var(--t2)] mt-0.5">Auto-healing infrastructure savings</p>
               </div>
               <span className="bg-[var(--c-purple)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                 {recommendations.length} Active
               </span>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-base)]">
              {recommendations.map((r, i) => (
                <div key={r.id} className="bg-[var(--bg-card)] border border-[var(--c-purple-bg)] rounded-md shadow-sm overflow-hidden hover:border-[var(--c-purple)] transition-colors">
                   <div className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                           r.type.includes("Query") ? "bg-[var(--c-blue-bg)] text-[var(--c-blue)]" :
                           r.type.includes("Idle") ? "bg-[var(--c-amber-bg)] text-[var(--c-amber)]" :
                           "bg-[var(--c-green-bg)] text-[var(--c-green)]"
                        }`}>
                           {r.type}
                        </span>
                        <span className="text-[12px] font-semibold text-[var(--c-green)] bg-[var(--c-green-bg)] px-2 py-0.5 rounded-full">
                           {r.impact}
                        </span>
                      </div>
                      <h4 className="text-[13px] font-medium text-[var(--t1)] mb-1 break-all">
                        <span className="text-[var(--t3)] font-mono mr-1">TGT:</span>{r.resource}
                      </h4>
                      <p className="text-[12px] text-[var(--t2)] leading-relaxed mb-3">
                        {r.description}
                      </p>
                      
                      {r.sql_suggestion && (
                        <div className="bg-[#0d1117] border border-[var(--b2)] rounded p-2 mb-3">
                          <code className="text-[11px] font-mono text-green-400 break-words whitespace-pre-wrap">
                            {r.sql_suggestion}
                          </code>
                        </div>
                      )}
                      
                      <button className="w-full bg-[var(--bg-base)] hover:bg-[var(--c-purple-bg)] hover:text-[var(--c-purple)] border border-[var(--b2)] hover:border-[var(--c-purple)] text-[var(--t1)] text-[12px] font-medium py-1.5 rounded transition-all flex items-center justify-center gap-1.5">
                        <Wrench size={13} /> Apply Auto-Optimization
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
