"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node, Position } from "reactflow";
import "reactflow/dist/style.css";
import { Network, ArrowLeft, Loader2, Database } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Lineage(props: PageProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableId, setTableId] = useState("");

  useEffect(() => {
    let active = true;
    props.params.then((p) => {
      if (!active) return;
      setTableId(p.id);
      setTimeout(() => {
        setNodes([
          { id: "src1", type: "input", data: { label: "postgres.raw_payments" }, position: { x: 50, y: 150 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d4d8', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace' } },
          { id: "src2", type: "input", data: { label: "postgres.raw_customers" }, position: { x: 50, y: 260 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', color: '#d4d4d8', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace' } },
          { id: "stg1", data: { label: "stg_payments" }, position: { x: 340, y: 150 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', color: '#c7d2fe', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace' } },
          { id: "stg2", data: { label: "stg_customers" }, position: { x: 340, y: 260 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', color: '#c7d2fe', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace' } },
          { id: "target", data: { label: p.id }, position: { x: 620, y: 200 }, sourcePosition: Position.Right, targetPosition: Position.Left, style: { background: 'rgba(34,197,94,0.08)', border: '2px solid rgba(34,197,94,0.3)', color: '#86efac', borderRadius: '10px', padding: '12px 18px', fontSize: '13px', fontWeight: '600', fontFamily: 'monospace', boxShadow: '0 0 20px rgba(34,197,94,0.1)' } },
        ]);
        setEdges([
          { id: "e1", source: "src1", target: "stg1", animated: true, style: { stroke: '#3f3f46', strokeWidth: 1.5 } },
          { id: "e2", source: "src2", target: "stg2", animated: true, style: { stroke: '#3f3f46', strokeWidth: 1.5 } },
          { id: "e3", source: "stg1", target: "target", animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
          { id: "e4", source: "stg2", target: "target", animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
        ]);
        setIsLoading(false);
      }, 600);
    });
    return () => { active = false; };
  }, [props.params]);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-5">
        <Link href="/catalog" className="inline-flex items-center gap-2 text-[13px] text-zinc-500 hover:text-indigo-400 transition-colors mb-3 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
          <Network className="w-6 h-6 text-indigo-400" /> Lineage: {tableId}
        </h1>
      </div>
      <div className="flex-1 neo-border rounded-xl overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm z-10">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        )}
        <ReactFlow nodes={nodes} edges={edges} fitView style={{ background: '#0a0a0a' }}>
          <Background color="#27272a" gap={24} size={1} />
          <Controls style={{ background: '#111', borderColor: 'rgba(255,255,255,0.06)', color: '#71717a' }} />
        </ReactFlow>
      </div>
    </div>
  );
}
