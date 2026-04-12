import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Database, Key, Hash, Calendar, Type, MoreHorizontal, Link2 } from 'lucide-react';

export type ColumnData = {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
};

export type ModelTableData = {
  label: string;
  tableType: 'fact' | 'dimension' | 'bridge';
  columns: ColumnData[];
  rowCount?: string;
};

const getIconForType = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('int') || t.includes('num') || t.includes('float') || t.includes('decimal')) return <Hash size={12} className="text-[var(--t4)]" />;
  if (t.includes('time') || t.includes('date')) return <Calendar size={12} className="text-[var(--t4)]" />;
  return <Type size={12} className="text-[var(--t4)]" />;
};

export type ModelNode = Node<ModelTableData, 'modelTable'>;

export const ModelTableNode = memo(({ data, selected }: NodeProps<ModelNode>) => {
  const isFact = data.tableType === 'fact';
  const headerBg = isFact ? 'var(--c-blue-bg)' : 'var(--c-green-bg)';
  const headerColor = isFact ? 'var(--c-blue)' : 'var(--c-green)';
  const borderColor = selected ? (isFact ? 'var(--c-blue)' : 'var(--c-green)') : 'var(--b2)';
  const shadow = selected ? (isFact ? '0 0 0 1px var(--c-blue), var(--sh-md)' : '0 0 0 1px var(--c-green), var(--sh-md)') : 'var(--sh-md)';

  return (
    <div 
      className="model-node" 
      style={{ 
        background: 'var(--bg-card)', 
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--r-md)',
        minWidth: 280,
        boxShadow: shadow,
        transition: 'border-color 150ms ease, box-shadow 150ms ease'
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      
      {/* Header */}
      <div 
        style={{ 
          background: headerBg, 
          padding: '12px 14px',
          borderTopLeftRadius: 'var(--r-md)',
          borderTopRightRadius: 'var(--r-md)',
          borderBottom: '1px solid var(--b2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={15} color={headerColor} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--font-mono)' }}>
            {data.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: headerColor, textTransform: 'uppercase', padding: '2px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: `1px solid ${headerColor}33` }}>
            {data.tableType}
          </span>
          <MoreHorizontal size={14} style={{ color: 'var(--t4)' }} />
        </div>
      </div>

      {/* Columns List */}
      <div style={{ padding: '6px 0' }}>
        {data.columns.map((col, idx) => (
          <div 
            key={col.name} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '6px 14px',
              position: 'relative',
              background: idx % 2 === 0 ? 'transparent' : 'var(--bg-surface)'
            }}
          >
            {/* Column-level Edge Handles */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`source-${col.name}`} 
              style={{ top: '50%', right: -4, width: 8, height: 8, background: headerColor, border: '1px solid var(--bg-card)' }}
            />
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`target-${col.name}`} 
              style={{ top: '50%', left: -4, width: 8, height: 8, background: headerColor, border: '1px solid var(--bg-card)' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {col.isPk ? (
                <Key size={13} style={{ color: 'var(--c-amber)' }} />
              ) : col.isFk ? (
                <Link2 size={13} style={{ color: 'var(--c-purple)' }} />
              ) : (
                getIconForType(col.type)
              )}
              <span style={{ 
                fontSize: 12.5, 
                fontWeight: col.isPk || col.isFk ? 600 : 500, 
                color: col.isPk || col.isFk ? 'var(--t1)' : 'var(--t2)', 
                fontFamily: 'var(--font-mono)' 
              }}>
                {col.name}
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--t4)', fontFamily: 'var(--font-mono)' }}>
              {col.type}
            </span>
          </div>
        ))}
      </div>
      
      {/* Footer Stats */}
      {data.rowCount && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--b2)', fontSize: 11, color: 'var(--t4)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-surface)', borderBottomLeftRadius: 'var(--r-md)', borderBottomRightRadius: 'var(--r-md)' }}>
          {data.rowCount} rows
        </div>
      )}
    </div>
  );
});

ModelTableNode.displayName = 'ModelTableNode';
