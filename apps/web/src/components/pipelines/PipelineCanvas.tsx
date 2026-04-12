import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PipelineNode from './nodes/PipelineNode';

// We register our custom beautiful node component
const nodeTypes = {
  customTaskNode: PipelineNode
};

// ==========================================
// BRAZILIAN E-COMMERCE DEMO TOPOLOGY (DAG)
// ==========================================
const initialNodes = [
  // INGESTION TIER
  {
    id: 'src_postgres',
    type: 'customTaskNode',
    position: { x: 50, y: 150 },
    data: {
      type: 'source', category: 'Ingestion', label: 'Olist PostgreSQL RDS',
      description: 'Legacy Orders & Payments', status: 'success', rows: 99441, lag: '12ms',
      isSource: true, isTarget: false, isActive: false
    }
  },
  {
    id: 'src_api',
    type: 'customTaskNode',
    position: { x: 50, y: 350 },
    data: {
      type: 'source', category: 'Ingestion', label: 'Geolocation API Stream',
      description: 'Zips Code Polling', status: 'running', rows: 8432, lag: '4s',
      isSource: true, isTarget: false, isActive: true
    }
  },

  // BRONZE TIER (RAW)
  {
    id: 'brz_orders',
    type: 'customTaskNode',
    position: { x: 350, y: 50 },
    data: {
      type: 'layer', category: 'Bronze (Raw)', label: 'raw_orders_dataset',
      description: 'Debezium CDC Snapshot', status: 'success', rows: 99441, lag: '15ms',
      isSource: true, isTarget: true, isActive: false
    }
  },
  {
    id: 'brz_payments',
    type: 'customTaskNode',
    position: { x: 350, y: 200 },
    data: {
      type: 'layer', category: 'Bronze (Raw)', label: 'raw_order_payments',
      description: 'Debezium CDC Snapshot', status: 'success', rows: 103886, lag: '15ms',
      isSource: true, isTarget: true, isActive: false
    }
  },
  {
    id: 'brz_geo',
    type: 'customTaskNode',
    position: { x: 350, y: 350 },
    data: {
      type: 'layer', category: 'Bronze (Raw)', label: 'raw_geolocation',
      description: 'Real-time Apache Kafka', status: 'running', rows: 8432, lag: '5s',
      isSource: true, isTarget: true, isActive: true
    }
  },

  // SILVER TIER (CLEANSING)
  {
    id: 'dbt_cleanse',
    type: 'customTaskNode',
    position: { x: 650, y: 125 },
    data: {
      type: 'transform', category: 'dbt Core', label: 'stg_olist_metrics',
      description: 'Join, Cleanse, Conform', status: 'success', rows: 98000, lag: '4m 12s',
      isSource: true, isTarget: true, isActive: false
    }
  },
  {
    id: 'spark_clustering',
    type: 'customTaskNode',
    position: { x: 650, y: 350 },
    data: {
      type: 'ml', category: 'PySpark EMR', label: 'Geo-Cluster Resolution',
      description: 'K-Means Zip Deduplication', status: 'running', rows: 8100, lag: '2m',
      isSource: true, isTarget: true, isActive: true
    }
  },

  // GOLD TIER (ANALYTICS)
  {
    id: 'gld_features',
    type: 'customTaskNode',
    position: { x: 950, y: 225 },
    data: {
      type: 'layer', category: 'Gold (Mart)', label: 'fct_seller_revenue',
      description: 'Aggregated Star Schema', status: 'success', rows: 3095, lag: '45ms',
      isSource: true, isTarget: true, isActive: false
    }
  },

  // DESTINATION (BI/APP)
  {
    id: 'dest_snowflake',
    type: 'customTaskNode',
    position: { x: 1250, y: 225 },
    data: {
      type: 'destination', category: 'Warehouse', label: 'Snowflake Enterprise',
      description: 'ANALYTICS_DB.Olist', status: 'success', rows: 3095, lag: '0ms',
      isSource: false, isTarget: true, isActive: false
    }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'src_postgres', target: 'brz_orders', animated: true, style: { stroke: 'var(--c-blue)' } },
  { id: 'e2', source: 'src_postgres', target: 'brz_payments', animated: true, style: { stroke: 'var(--c-blue)' } },
  { id: 'e3', source: 'src_api', target: 'brz_geo', animated: true, style: { stroke: 'var(--c-blue)' } },

  { id: 'e4', source: 'brz_orders', target: 'dbt_cleanse', animated: false, style: { stroke: 'var(--t4)' } },
  { id: 'e5', source: 'brz_payments', target: 'dbt_cleanse', animated: false, style: { stroke: 'var(--t4)' } },
  { id: 'e6', source: 'brz_geo', target: 'spark_clustering', animated: true, style: { stroke: 'var(--c-amber)' } },

  { id: 'e7', source: 'dbt_cleanse', target: 'gld_features', animated: false, style: { stroke: 'var(--t4)' } },
  { id: 'e8', source: 'spark_clustering', target: 'gld_features', animated: true, style: { stroke: 'var(--c-amber)' } },

  { id: 'e9', source: 'gld_features', target: 'dest_snowflake', animated: false, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--c-green)' }, style: { stroke: 'var(--c-green)', strokeWidth: 2 } },
];


export default function PipelineCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--c-brand)' } }, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full min-h-[500px] border border-[var(--b2)] rounded-lg overflow-hidden bg-[var(--bg-muted)] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="dataflow-canvas-theme bg-[#0a0c10]"
      >
        <Controls showInteractive={false} className="bg-[var(--bg-card)] border border-[var(--b2)] fill-[var(--t1)] text-[var(--t1)]" />
        <MiniMap 
           nodeStrokeColor={(n) => {
             if (n.type === 'customTaskNode') return '#4a90e2';
             return '#fff';
           }}
           nodeColor={(n) => {
             return '#1e293b';
           }}
           maskColor="rgba(0, 0, 0, 0.7)"
           className="bg-[var(--bg-card)] border border-[var(--b2)] rounded-lg overflow-hidden" 
        />
        <Background gap={24} color="var(--b2)" />
      </ReactFlow>

      {/* Floating Canvas Meta Overlays */}
      <div className="absolute top-4 left-4 flex gap-2">
         <div className="bg-[#111827]/80 backdrop-blur border border-[var(--b2)] rounded px-3 py-1.5 flex items-center gap-2 text-[12px] font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--c-green)] animate-pulse"></span>
            <span className="text-[var(--t2)] tracking-wider uppercase font-bold text-[10px]">Canvas Mode: Ascend Data Mesh</span>
         </div>
      </div>
    </div>
  );
}
