"use client";

import React, { useState } from "react";
import { AlertCircle, Bot, CheckCircle2, Loader2, ChevronDown, ChevronUp, Zap } from "lucide-react";
import Editor from "@monaco-editor/react";

interface Alert {
  id: string;
  pipeline_name: string;
  error_type: string;
  message: string;
  severity: "warning" | "critical";
  detected_at: string;
  status: "open" | "investigating" | "resolved";
  ai_suggestion?: string;
}

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);
  const [healing, setHealing] = useState(false);
  const [healed, setHealed] = useState(alert.status === "resolved");

  const handleHeal = async () => {
    setHealing(true);
    await new Promise(r => setTimeout(r, 2000));
    setHealing(false);
    setHealed(true);
  };

  const severityProps = alert.severity === 'critical' 
    ? { border: 'rgba(209,52,56,0.3)', bg: 'rgba(209,52,56,0.05)', iconColor: '#d13438' } 
    : { border: 'rgba(240,163,10,0.3)', bg: 'rgba(240,163,10,0.05)', iconColor: '#f0a30a' };

  const statusColor = healed ? '#0ea65b' : alert.status === 'investigating' ? '#f0a30a' : '#d13438';

  return (
    <div className={`rounded-lg overflow-hidden transition-opacity ${healed ? 'opacity-70' : ''}`} style={{ background: '#252529', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div 
        className="px-5 py-4 flex items-center justify-between cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = severityProps.bg; }}
        style={{ 
          background: severityProps.bg, 
          borderLeft: `3px solid ${severityProps.iconColor}`
        }}
      >
        <div className="flex items-center gap-3">
          {healed ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#0ea65b' }} />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" style={{ color: severityProps.iconColor }} />
          )}
          <div>
            <p className="text-[13px] font-semibold text-[#f3f3f3]">{alert.message}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-[#9d9d9d] font-mono">{alert.pipeline_name}</span>
              <span className="text-[11px] text-[#6d6d6d]">•</span>
              <span className="text-[11px] font-medium" style={{ color: statusColor }}>{healed ? 'Resolved' : alert.status}</span>
              <span className="text-[11px] text-[#6d6d6d]">•</span>
              <span className="text-[11px] text-[#0078D4]" style={{ padding: '2px 6px', background: 'rgba(0,120,212,0.1)', borderRadius: '4px', border: '1px solid rgba(0,120,212,0.2)', fontSize: '10px' }}>{alert.error_type}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!healed && alert.ai_suggestion && (
            <button onClick={(e) => { e.stopPropagation(); handleHeal(); }} disabled={healing}
              className="btn-primary text-[12px] px-3 py-1.5" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {healing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Zap className="w-3.5 h-3.5" /> Auto-Heal</>}
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-[#6d6d6d]" /> : <ChevronDown className="w-4 h-4 text-[#6d6d6d]" />}
        </div>
      </div>

      {/* Expandable SQL */}
      {expanded && alert.ai_suggestion && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-5 py-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ background: '#17171b', color: '#9d9d9d' }}>
            <Bot className="w-3.5 h-3.5" style={{ color: '#0078D4' }} /> AI-Generated Fix
          </div>
          <div className="h-[150px]">
            <Editor height="100%" defaultLanguage="sql" theme="vs-dark" value={alert.ai_suggestion}
              options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 12, padding: { top: 8, bottom: 8 }, lineNumbers: "off" }} />
          </div>
        </div>
      )}
    </div>
  );
};
