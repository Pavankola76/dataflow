import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Database, ShieldAlert, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export type LineageNodeData = {
  label: string;
  layer: 'bronze' | 'silver' | 'gold' | 'source';
  pii: boolean;
  status: 'healthy' | 'issue' | 'warning';
};

export type LineageType = Node<LineageNodeData, 'lineageNode'>;

const getLayerColor = (layer: string) => {
  switch(layer) {
    case 'bronze': return 'var(--c-amber)';
    case 'silver': return 'var(--c-zinc)';
    case 'gold': return 'var(--c-green)';
    default: return 'var(--c-blue)';
  }
};

export const LineageNode = memo(({ data, selected }: NodeProps<LineageType>) => {
  const layerColor = getLayerColor(data.layer);
  const borderColor = selected ? layerColor : 'var(--b2)';
  const shadow = selected ? `0 0 0 1px ${layerColor}, var(--sh-md)` : 'var(--sh-md)';

  return (
    <div 
      className="model-node" 
      style={{ 
        background: 'var(--bg-card)', 
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--r-md)',
        minWidth: 260,
        boxShadow: shadow,
        transition: 'border-color 150ms ease, box-shadow 150ms ease'
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      
      {/* Header */}
      <div 
        style={{ 
          padding: '12px 14px',
          borderBottom: '1px solid var(--b2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          borderTopLeftRadius: 'var(--r-md)',
          borderTopRightRadius: 'var(--r-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={15} color={layerColor} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', fontFamily: 'var(--font-mono)' }}>
            {data.label}
          </span>
        </div>
      </div>

      {/* Body Metadata */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={12}/> Zone</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: layerColor, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 10, border: `1px solid ${layerColor}33` }}>{data.layer.toUpperCase()}</span>
         </div>
         
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Privacy</span>
            {data.pii ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--c-amber)] bg-[var(--c-amber-bg)] px-2 py-0.5 rounded-full border border-[var(--c-amber)]/20">
                    <ShieldAlert size={12} strokeWidth={2.5} /> PII FOUND
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--c-green)] bg-[var(--c-green-bg)] px-2 py-0.5 rounded-full border border-[var(--c-green)]/20">
                    <CheckCircle2 size={12} strokeWidth={2.5} /> CLEAR
                </span>
            )}
         </div>

         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contract</span>
            {data.status === 'issue' ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--c-red)] bg-[var(--c-red-bg)] px-2 py-0.5 rounded-full border border-[var(--c-red)]/20">
                    <AlertTriangle size={12} strokeWidth={2.5} /> FAILING
                </span>
            ) : data.status === 'warning' ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--c-amber)] bg-[var(--c-amber-bg)] px-2 py-0.5 rounded-full border border-[var(--c-amber)]/20">
                    <AlertTriangle size={12} strokeWidth={2.5} /> WARNING
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--c-green)] bg-[var(--c-green-bg)] px-2 py-0.5 rounded-full border border-[var(--c-green)]/20">
                    <CheckCircle2 size={12} strokeWidth={2.5} /> PASSING
                </span>
            )}
         </div>
      </div>
      
    </div>
  );
});

LineageNode.displayName = 'LineageNode';
