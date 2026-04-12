"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactFlow, { Background, Controls, MarkerType, Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import { Activity, Play, Server, Database, ArrowRight, Clock, Waves, Gauge, Loader2, FastForward } from "lucide-react";
import { useAuthStore } from "@/stores";

// -- Custom Node Definitions --

const KafkaNode = ({ data }: any) => (
  <div className="bg-[#0d1117] border-[2px] border-[#23D18B] rounded-xl shadow-lg w-64 overflow-hidden relative">
    <Handle type="source" position={Position.Right} className="w-2 h-2 bg-[#23D18B] border-none" />
    <div className="bg-[#23D18B]/10 px-4 py-3 border-b border-[#23D18B]/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Server size={16} className="text-[#23D18B]" />
        <span className="text-[13px] font-semibold text-[#23D18B]">Kafka Topic</span>
      </div>
      <span className="w-2 h-2 rounded-full bg-[#23D18B] animate-pulse"></span>
    </div>
    <div className="p-4 space-y-3">
      <div>
        <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider mb-1">Topic Name</div>
        <div className="text-[13px] font-mono text-[var(--t1)]">{data.topic}</div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider mb-1">Partitions</div>
          <div className="text-[14px] font-mono text-[var(--t1)]">{data.partitions}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider mb-1">Throughput</div>
          <div className="text-[14px] font-mono text-[#23D18B]">{data.throughput} msg/s</div>
        </div>
      </div>
    </div>
  </div>
);

const FlinkNode = ({ data }: any) => (
  <div className="bg-[#0d1117] border-[2px] border-[#E6522C] rounded-xl shadow-lg w-64 overflow-hidden relative">
    <Handle type="target" position={Position.Left} className="w-2 h-2 bg-[#E6522C] border-none" />
    <Handle type="source" position={Position.Right} className="w-2 h-2 bg-[#E6522C] border-none" />
    {data.status === 'warning' && (
      <div className="absolute top-0 right-0 w-full h-full bg-[#E6522C]/5 animate-pulse pointer-events-none"></div>
    )}
    <div className="bg-[#E6522C]/10 px-4 py-3 border-b border-[#E6522C]/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Waves size={16} className="text-[#E6522C]" />
        <span className="text-[13px] font-semibold text-[#E6522C]">Apache Flink</span>
      </div>
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${data.status === 'warning' ? 'bg-[#E6522C]/20 text-[#E6522C] border border-[#E6522C]/50' : 'bg-transparent'}`}>
        {data.status.toUpperCase()}
      </span>
    </div>
    <div className="p-4 space-y-3">
      <div>
        <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider mb-1">Job Name</div>
        <div className="text-[13px] font-mono text-[var(--t1)] truncate">{data.job_name}</div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider mb-1">Consumer Lag</div>
          <div className={`text-[14px] font-mono ${data.status === 'warning' ? 'text-[#E6522C] font-bold' : 'text-[var(--t1)]'}`}>{data.lag} ms</div>
        </div>
      </div>
      <div>
        <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider mb-1">Watermark</div>
        <div className="text-[11px] font-mono text-[var(--t2)]">{new Date(data.watermark).toLocaleTimeString()}</div>
      </div>
    </div>
  </div>
);

const SinkNode = ({ data }: any) => (
  <div className="bg-[#0d1117] border-[2px] border-[var(--c-blue)] rounded-xl shadow-lg w-64 overflow-hidden relative">
    <Handle type="target" position={Position.Left} className="w-2 h-2 bg-[var(--c-blue)] border-none" />
    <div className="bg-[var(--c-blue)]/10 px-4 py-3 border-b border-[var(--c-blue)]/30 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-[var(--c-blue)]" />
        <span className="text-[13px] font-semibold text-[var(--c-blue)]">Iceberg Sink</span>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div>
        <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider mb-1">Target Table</div>
        <div className="text-[13px] font-mono text-[var(--t1)]">{data.table}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider">Write Rate</div>
        <div className="text-[14px] font-mono text-[var(--c-blue)]">{data.write_rate} ops/s</div>
      </div>
    </div>
  </div>
);

// -- Main Component --

export default function StreamingDagPage() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  const nodeTypes = useMemo(() => ({ kafka: KafkaNode, flink: FlinkNode, sink: SinkNode }), []);

  const fetchTopology = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/v1/streams/topology", {
         headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.nodes && Array.isArray(data.edges)) {
        setNodes(data.nodes);
        
        // Map edges to apply specific styling for streaming
        const mappedEdges = data.edges.map((e: any) => ({
          ...e,
          style: { stroke: '#E6522C', strokeWidth: 2 },
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#E6522C' }
        }));
        setEdges(mappedEdges);
        setMetrics(data.metrics);
      } else {
        setNodes([]);
        setEdges([]);
        setMetrics(null);
      }
    } catch (err) {
      console.error("Failed to fetch stream topology", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(fetchTopology, 3000); // 3 second polling for real-time feel
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="animate-spin text-[var(--c-blue)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page-content animate-in h-screen flex flex-col overflow-hidden">
      <div className="page-header shrink-0 mb-0 border-b border-[var(--b2)] pb-4 z-10 bg-[var(--bg-base)]">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity size={20} className="text-[#E6522C]" />
            Real-Time Streaming DAG
          </h1>
          <p className="page-subtitle">Monitor live Event-Driven Architectures and physical Apache Flink processing latencies.</p>
        </div>
        <div className="page-header-actions flex gap-3">
           <div className="flex gap-4 mr-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider">Total Throughput</span>
                <span className="text-[16px] font-mono font-bold text-[#23D18B]">{metrics?.total_throughput_msg_sec} <span className="text-[10px] text-[var(--t2)] font-sans font-normal">msg/s</span></span>
              </div>
              <div className="w-px h-8 bg-[var(--b2)]"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--t3)] uppercase font-semibold tracking-wider">Max Lag</span>
                <span className="text-[16px] font-mono font-bold text-[#E6522C]">{metrics?.max_consumer_lag_ms} <span className="text-[10px] text-[var(--t2)] font-sans font-normal">ms</span></span>
              </div>
           </div>
           
           <button className="bg-[var(--bg-card)] border border-[var(--b2)] text-[var(--t1)] text-[13px] font-medium px-4 py-1.5 rounded transition-colors flex items-center gap-2 shadow-sm">
             <Gauge size={14} className="text-[var(--t3)]"/> Optimize Backpressure
           </button>
           <button className="bg-[#E6522C] hover:bg-[#ff5d33] text-white border border-transparent text-[13px] font-medium px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-2">
             <FastForward size={14} /> Deploy Stream
           </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[var(--bg-canvas)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#ffffff" gap={24} size={1} />
          <Controls className="!bg-[var(--bg-card)] !border-[var(--b2)] !fill-[var(--t1)]" />
        </ReactFlow>
        
        {/* Decorative Overlay Box */}
        <div className="absolute bottom-6 left-6 bg-[#0d1117]/80 backdrop-blur-md border border-[var(--b2)] rounded-lg p-4 shadow-xl pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-[#E6522C] animate-pulse"></div>
             <span className="text-[12px] font-mono text-[var(--t1)] font-semibold">Live Telemetry Active</span>
          </div>
          <p className="text-[11px] text-[var(--t3)] max-w-[200px] leading-tight mb-2">
            The Directed Acyclic Graph is currently polling FastApi layer every 3 seconds to fetch structural node payloads.
          </p>
          <div className="flex gap-2">
             <span className="text-[10px] text-[#23D18B] bg-[#23D18B]/10 border border-[#23D18B]/20 px-1.5 rounded">Kafka Polling</span>
             <span className="text-[10px] text-[#E6522C] bg-[#E6522C]/10 border border-[#E6522C]/20 px-1.5 rounded">Flink Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
}
