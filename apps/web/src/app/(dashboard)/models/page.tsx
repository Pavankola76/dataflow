"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Editor from "@monaco-editor/react";
import { ModelTableNode, ModelTableData } from "@/components/canvas/ModelTableNode";
import { Play, Sparkles, Check, Download, Share2, Layers, Search, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/stores";

/* ------------------------------------------------------------------ */
/*  Mock Data Models (Star Schema Example)                             */
/* ------------------------------------------------------------------ */
const initialNodes = [
  {
    id: "fact_orders",
    type: "modelTable",
    position: { x: 350, y: 150 },
    data: {
      label: "fact_orders",
      tableType: "fact",
      rowCount: "14.2M",
      columns: [
        { name: "order_id", type: "varchar", isPk: true },
        { name: "customer_id", type: "varchar", isFk: true },
        { name: "product_id", type: "varchar", isFk: true },
        { name: "date_id", type: "int", isFk: true },
        { name: "order_amount", type: "decimal(18,2)" },
        { name: "tax_amount", type: "decimal(18,2)" },
        { name: "discount_amount", type: "decimal(18,2)" },
        { name: "order_status", type: "varchar" },
      ]
    }
  },
  {
    id: "dim_customers",
    type: "modelTable",
    position: { x: 50, y: 50 },
    data: {
      label: "dim_customers",
      tableType: "dimension",
      rowCount: "1.2M",
      columns: [
        { name: "customer_id", type: "varchar", isPk: true },
        { name: "first_name", type: "varchar" },
        { name: "last_name", type: "varchar" },
        { name: "email", type: "varchar" },
        { name: "country", type: "varchar" },
        { name: "segment", type: "varchar" },
        { name: "created_at", type: "timestamp" },
      ]
    }
  },
  {
    id: "dim_products",
    type: "modelTable",
    position: { x: 50, y: 350 },
    data: {
      label: "dim_products",
      tableType: "dimension",
      rowCount: "450K",
      columns: [
        { name: "product_id", type: "varchar", isPk: true },
        { name: "name", type: "varchar" },
        { name: "category", type: "varchar" },
        { name: "brand", type: "varchar" },
        { name: "unit_price", type: "decimal(18,2)" },
        { name: "is_active", type: "boolean" },
      ]
    }
  },
  {
    id: "dim_dates",
    type: "modelTable",
    position: { x: 750, y: 200 },
    data: {
      label: "dim_dates",
      tableType: "dimension",
      rowCount: "3650",
      columns: [
        { name: "date_id", type: "int", isPk: true },
        { name: "full_date", type: "date" },
        { name: "year", type: "int" },
        { name: "quarter", type: "int" },
        { name: "month", type: "int" },
        { name: "day_of_week", type: "int" },
        { name: "is_weekend", type: "boolean" },
      ]
    }
  }
];

const initialEdges: Edge[] = [
  { 
    id: "e-cust-order", 
    source: "dim_customers", 
    target: "fact_orders", 
    sourceHandle: "source-customer_id", 
    targetHandle: "target-customer_id", 
    animated: true,
    style: { stroke: 'var(--c-purple)', strokeWidth: 2 }
  },
  { 
    id: "e-prod-order", 
    source: "dim_products", 
    target: "fact_orders", 
    sourceHandle: "source-product_id", 
    targetHandle: "target-product_id", 
    animated: true,
    style: { stroke: 'var(--c-purple)', strokeWidth: 2 }
  },
  { 
    id: "e-date-order", 
    source: "dim_dates", 
    target: "fact_orders", 
    sourceHandle: "target-date_id", // connected backwards for visual layout
    targetHandle: "source-date_id", 
    animated: true,
    style: { stroke: 'var(--c-purple)', strokeWidth: 2 }
  }
];


export default function ModelsDashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeFiles, setActiveFiles] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("");

  const nodeTypes = useMemo(() => ({ modelTable: ModelTableNode }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--c-purple)', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const { token } = useAuthStore();

  const triggerAI = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/models/generate-dbt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ visual_model: { nodes, edges } }),
      });
      const data = await response.json();
      const generatedFiles = data.dbt_files || {};
      if (generatedFiles["models/marts/_marts__models.yml"]) {
          generatedFiles["models/marts/schema.yml"] = generatedFiles["models/marts/_marts__models.yml"];
          delete generatedFiles["models/marts/_marts__models.yml"];
      }
      setActiveFiles(generatedFiles);
      if (Object.keys(generatedFiles).length > 0) setActiveTab(Object.keys(generatedFiles)[0]);
    } catch (e) {
      console.error(e);
      alert("Failed to reach AI Backend");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="page-content animate-in h-[calc(100vh-52px)] !p-0 flex flex-col">
      {/* Top Banner Toolbar */}
      <div className="page-header !mb-0 px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--b2)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--c-blue-bg)] text-[var(--c-blue)] flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Core Warehouse Models</h1>
            <p className="text-[13px] text-[var(--t3)]">Visually map facts and dimensions. AI regenerates equivalent dbt SQL automatically.</p>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn-ghost-console" onClick={triggerAI}>
            {isAiLoading ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} className="text-[var(--c-purple)]" />}
            Compile dbt Project
          </button>
          <div className="w-[1px] h-6 bg-[var(--b2)] mx-2"></div>
          <button className="btn-ghost-console"><Share2 size={15} /> Share</button>
          <button className="btn-primary-console">
            <Play size={15} fill="currentColor" /> Deploy dbt Project
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 min-h-0 flex" style={{ background: 'var(--bg-base)' }}>
        
        {/* Left Side: React Flow Canvas */}
        <div className="flex-1 h-full relative" style={{ borderRight: '1px solid var(--b2)' }}>
          {/* Quick Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--b2)] rounded-md px-3 py-1.5 shadow-sm text-[13px] text-[var(--t2)] font-medium">
              <Search size={14} className="text-[var(--t4)]" />
              <span>Search nodes (⌘K)</span>
            </div>
            <button className="bg-[var(--bg-surface)] border border-[var(--b2)] rounded-md px-3 py-1.5 shadow-sm text-[13px] text-[var(--t2)] font-medium hover:bg-[var(--bg-muted)] transition-colors">
               + Add Table
            </button>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            minZoom={0.2}
          >
            <Background color="var(--t4)" gap={24} size={1} />
            <Controls className="!bg-[var(--bg-surface)] !border-[var(--b2)] !shadow-sm !rounded-md overflow-hidden [&>button]:!bg-transparent [&>button]:!border-b-[var(--b2)] [&>button:last-child]:!border-none [&>button]:!text-[var(--t2)] [&>button:hover]:!bg-[var(--bg-muted)]" />
            <MiniMap 
              nodeColor={(n) => n.data.tableType === 'fact' ? 'var(--c-blue)' : 'var(--c-green)'}
              maskColor="var(--bg-topbar)"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--b2)', borderRadius: 'var(--r-md)' }}
            />
          </ReactFlow>
        </div>

        {/* Right Side: Monaco Editor (dbt SQL Viewer) */}
        <div className="w-[500px] xl:w-[650px] h-full flex flex-col bg-[var(--bg-sidebar)]">
          {/* Editor Header Tabs */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--b2)] bg-[var(--bg-surface)] flex-shrink-0">
            <div className="flex gap-2 flex-wrap">
              {Object.keys(activeFiles).length > 0 ? Object.keys(activeFiles).map(file => (
                <span 
                  key={file}
                  onClick={() => setActiveTab(file)}
                  className={`text-[12px] font-mono px-3 py-1 rounded-md border shadow-sm cursor-pointer transition-colors ${activeTab === file ? 'text-[var(--t2)] bg-[var(--bg-base)] border-[var(--b1)]' : 'text-[var(--t4)] hover:bg-[var(--bg-muted)] border-transparent'}`}
                >
                  {file.split('/').pop()}
                </span>
              )) : (
                <span className="text-[12px] font-mono text-[var(--t4)] px-3 py-1">
                  Awaiting Visual Mapping...
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
               <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--c-green)] bg-[var(--c-green-bg)] px-2 py-0.5 rounded-full">
                 <Check size={12} /> Sync Active
               </span>
               <Download size={15} className="text-[var(--t4)] cursor-pointer hover:text-[var(--t2)]" />
            </div>
          </div>
          
          {/* Editor Body */}
          <div className="flex-1 min-h-0 pt-4">
            <Editor
              height="100%"
              language={activeTab.endsWith('.yml') ? 'yaml' : 'sql'}
              theme="vs-dark"
              value={activeFiles[activeTab] || "-- Click 'AI Auto-Layout' to generate compiled DWH architecture"}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                lineHeight: 1.6,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'none',
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                // Overriding default VS Code dark theme slightly to match our pure blacks
                // Monaco doesn't let us pass CSS vars directly easily without defined custom themes, 
                // so we rely on vs-dark as a close proxy within our iframe
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
