import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, Filter, Target, Zap, Activity, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

const iconMap = {
  source: Database,
  transform: Filter,
  destination: Target,
  ml: Activity,
  orchestration: Clock,
  layer: Layers
};

function PipelineNode({ data, isConnectable }: any) {
  const Icon = iconMap[data.type as keyof typeof iconMap] || Zap;
  
  return (
    <div className={`relative px-4 py-3 min-w-[220px] rounded-xl border border-[var(--b2)] bg-[var(--bg-card)]/80 backdrop-blur-xl shadow-lg transition-transform hover:scale-[1.02] hover:shadow-[var(--c-brand)]/20 ${data.isActive ? 'ring-2 ring-[var(--c-brand)]' : ''}`}>
      
      {data.isSource && (
        <Handle 
          type="source" 
          position={Position.Right} 
          isConnectable={isConnectable} 
          className="w-3 h-3 bg-[var(--c-brand)] border-2 border-[var(--bg-card)] translate-x-1.5"
        />
      )}
      {data.isTarget && (
        <Handle 
          type="target" 
          position={Position.Left} 
          isConnectable={isConnectable}
          className="w-3 h-3 bg-[var(--c-brand)] border-2 border-[var(--bg-card)] -translate-x-1.5"
        />
      )}
      
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${data.type === 'source' ? 'bg-emerald-500/20 text-emerald-400' : data.type === 'destination' ? 'bg-rose-500/20 text-rose-400' : 'bg-[var(--c-brand)]/20 text-[var(--c-brand)]'}`}>
               <Icon size={14} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--t3)]">
               {data.category}
            </span>
         </div>
         {data.status === 'success' && <CheckCircle2 size={13} className="text-emerald-400" />}
         {data.status === 'running' && <Activity size={13} className="text-blue-400 animate-pulse" />}
         {data.status === 'error' && <AlertTriangle size={13} className="text-rose-400" />}
      </div>

      {/* Node Body */}
      <div className="w-full overflow-hidden">
         <h3 className="text-[13px] font-semibold text-[var(--t1)] truncate mb-0.5" title={data.label}>{data.label}</h3>
         {data.description && (
           <p className="text-[11px] text-[var(--t3)] truncate" title={data.description}>{data.description}</p>
         )}
      </div>

      {/* Node Telemetry Footer */}
      {(data.rows || data.lag) && (
        <div className="mt-3 pt-2 border-t border-[var(--b2)] flex items-center justify-between gap-2">
           {data.rows && (
             <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-[var(--t3)]">Processed</span>
                <span className="text-[11px] font-mono text-[var(--t1)]">{data.rows.toLocaleString()}</span>
             </div>
           )}
           {data.lag && (
             <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase tracking-wider text-[var(--t3)]">Latency</span>
                <span className="text-[11px] font-mono text-emerald-400">{data.lag}</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default memo(PipelineNode);
