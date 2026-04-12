"use client";

import React, { useState, useMemo } from "react";
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, Edge, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { LineageNode } from "@/components/canvas/LineageNode";
import { Search, GitBranch, Filter, Download, Zap, Database, Calendar, ShieldAlert } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock Lineage Graph                                                 */
/* ------------------------------------------------------------------ */
const initialNodes = [
  {
    id: "src_stripe",
    type: "lineageNode",
    position: { x: 50, y: 100 },
    data: { label: "raw.stripe_events", layer: "source", pii: true, status: "healthy" }
  },
  {
    id: "src_salesforce",
    type: "lineageNode",
    position: { x: 50, y: 300 },
    data: { label: "raw.salesforce_accounts", layer: "source", pii: true, status: "healthy" }
  },
  {
    id: "bronze_events",
    type: "lineageNode",
    position: { x: 400, y: 50 },
    data: { label: "bronze.idx_stripe_events", layer: "bronze", pii: true, status: "warning" }
  },
  {
    id: "bronze_accounts",
    type: "lineageNode",
    position: { x: 400, y: 350 },
    data: { label: "bronze.sf_accounts_raw", layer: "bronze", pii: true, status: "issue" }
  },
  {
    id: "silver_users",
    type: "lineageNode",
    position: { x: 750, y: 200 },
    data: { label: "silver.stg_users", layer: "silver", pii: false, status: "healthy" }
  },
  {
    id: "gold_metrics",
    type: "lineageNode",
    position: { x: 1100, y: 200 },
    data: { label: "core.fct_mrr_metrics", layer: "gold", pii: false, status: "healthy" }
  }
];

const edgeStyle = (status: string) => ({
  stroke: status === 'issue' ? 'var(--c-red)' : status === 'warning' ? 'var(--c-amber)' : 'var(--b1)',
  strokeWidth: status === 'issue' ? 3 : 2,
});

const initialEdges: Edge[] = [
  { id: "e1", source: "src_stripe", target: "bronze_events", style: edgeStyle("healthy"), animated: true },
  { id: "e2", source: "src_salesforce", target: "bronze_accounts", style: edgeStyle("healthy"), animated: true },
  { id: "e3", source: "bronze_events", target: "silver_users", style: edgeStyle("warning"), animated: true },
  { id: "e4", source: "bronze_accounts", target: "silver_users", style: edgeStyle("issue"), animated: true },
  { id: "e5", source: "silver_users", target: "gold_metrics", style: edgeStyle("healthy"), animated: true },
];

export default function LineageDashboard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const nodeTypes = useMemo(() => ({ lineageNode: LineageNode }), []);

  const handleNodeClick = (e: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="page-content animate-in h-[calc(100vh-52px)] !p-0 flex flex-col">
      {/* Top Banner Toolbar */}
      <div className="page-header !mb-0 px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--b2)' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--c-purple-bg)] text-[var(--c-purple)] flex items-center justify-center">
            <GitBranch size={20} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-[var(--t1)] tracking-tight">Data Lineage Explorer</h1>
            <p className="text-[13px] text-[var(--t3)]">Visualize implicit dependencies, column-level mapping, and PII bleed.</p>
          </div>
        </div>
        <div className="page-header-actions">
          <div className="table-search relative w-[250px] mr-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t4)]" />
            <input 
                placeholder="Search tables..." 
                className="w-full bg-[var(--bg-surface)] border border-[var(--b2)] rounded-md pl-9 pr-3 py-1.5 text-[13px] text-[var(--t1)]"
            />
          </div>
          <button className="btn-ghost-console"><Filter size={15} /> Filter Layer</button>
          <button className="btn-primary-console">
            <Download size={15} /> Export Graph
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 min-h-0 flex" style={{ background: 'var(--bg-base)' }}>
        
        {/* Left Side: React Flow Canvas */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            minZoom={0.2}
          >
            <Background color="var(--t4)" gap={24} size={1.5} variant={BackgroundVariant.Dots} />
            <Controls className="!bg-[var(--bg-surface)] !border-[var(--b2)] !shadow-sm !rounded-md overflow-hidden [&>button]:!bg-transparent [&>button]:!border-b-[var(--b2)] [&>button:last-child]:!border-none [&>button]:!text-[var(--t2)] [&>button:hover]:!bg-[var(--bg-muted)]" />
            <MiniMap 
              nodeColor={(n) => n.data.layer === 'bronze' ? 'var(--c-amber)' : 'var(--c-blue)'}
              maskColor="var(--bg-topbar)"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--b2)', borderRadius: 'var(--r-md)' }}
            />
          </ReactFlow>
        </div>

        {/* Right Side: Inspector Sidebar */}
        {selectedNode && (
          <div className="w-[350px] border-l border-[var(--b2)] bg-[var(--bg-sidebar)] flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)] z-10 animate-in slide-in-from-right-8 duration-200">
            <div className="p-5 border-b border-[var(--b2)]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-[var(--bg-surface)] border border-[var(--b2)]">
                        <Database size={16} className="text-[var(--t2)]" />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-bold text-[var(--t1)] break-all">{selectedNode.data.label}</h2>
                        <p className="text-[12px] text-[var(--t4)] font-mono mt-0.5">Asset ID: {selectedNode.id}</p>
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-6 overflow-y-auto">
                <div className="flex flex-col gap-3 border border-[var(--b2)] rounded-lg p-4 bg-[var(--bg-surface)]">
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[var(--t3)] font-medium">Architecture Layer</span>
                        <span className="text-[12px] font-bold text-[var(--c-purple)]">{selectedNode.data.layer.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[var(--t3)] font-medium">Data Contract</span>
                        {selectedNode.data.status === 'healthy' ? (
                            <span className="text-[12px] font-medium text-[var(--c-green)]">Valid</span>
                        ) : selectedNode.data.status === 'warning' ? (
                            <span className="text-[12px] font-medium text-[var(--c-amber)]">Stale (+2hrs)</span>
                        ) : (
                            <span className="text-[12px] font-medium text-[var(--c-red)]">Failed Check</span>
                        )}
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[var(--t3)] font-medium">Last Refresh</span>
                        <span className="text-[12px] font-medium text-[var(--t2)] font-mono">10 mins ago</span>
                    </div>
                </div>

                {selectedNode.data.status === 'issue' && (
                    <div className="flex flex-col gap-2 p-3.5 bg-[var(--c-red-bg)] border border-[var(--c-red)]/20 rounded-lg">
                        <div className="text-[13px] font-bold text-[var(--c-red)] flex items-center gap-2">
                           <Zap size={14} /> Pipeline Blocked!
                        </div>
                        <p className="text-[12px] text-[var(--c-red)]/80 leading-relaxed">
                            This dataset has failed consecutive Great Expectations quality gate tests. Upstream schemas unexpectedly dropped `user_id`.
                        </p>
                    </div>
                )}

                {selectedNode.data.pii && (
                    <div className="flex flex-col gap-2 p-3.5 bg-[var(--c-amber-bg)] border border-[var(--c-amber)]/20 rounded-lg">
                        <div className="text-[13px] font-bold text-[var(--c-amber)] flex items-center gap-2">
                           <ShieldAlert size={14} /> PII Exposure Found
                        </div>
                        <p className="text-[12px] text-[var(--c-amber)]/80 leading-relaxed">
                            The LangGraph Agent automatically detected SSN and Email structures within the underlying schema definition.
                        </p>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
