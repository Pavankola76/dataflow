"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAnalyticsStore } from "@/stores";
import { Bot, User, Loader2, Sparkles, Send } from "lucide-react";
import { ChartWidget } from "@/components/analytics/ChartWidget";
import Editor from "@monaco-editor/react";

export const QueryChat = () => {
  const { 
    messages: chatHistory = [], 
    isLoading, 
    submitQuery 
  } = useAnalyticsStore();
  
  const [inputQuery, setInputQuery] = useState("");
  const endOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputQuery.trim() && !isLoading) {
        submitQuery(inputQuery);
        setInputQuery("");
      }
    }
  };

  return (
    <div className="flex flex-col h-full rounded-[var(--r-xl)] overflow-hidden shadow-lg transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <h2 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Natural Language Engine
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-accent)' }}>
          <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: 'var(--accent)' }}>Agentic</span>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--teal)' }} />
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: 'var(--bg-base)' }}>
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
            <Bot className="w-14 h-14 mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>How can I help?</h3>
            <p className="text-[14px] max-w-sm" style={{ color: 'var(--text-secondary)' }}>Ask about revenue, cohorts, or pipeline performance. I'll translate to SQL and visualize instantly.</p>
          </div>
        ) : (
          chatHistory.map((msg: any, idx: number) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
                >
                  <Bot className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
              )}
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.content && (
                  <div 
                    className={`px-5 py-3.5 text-[14.5px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'rounded-2xl rounded-tr-sm text-white' 
                        : 'rounded-2xl rounded-tl-sm'
                    }`}
                    style={{ 
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-default)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)'
                    }}
                  >
                    {msg.content}
                  </div>
                )}
                {msg.sql && (
                  <div className="w-full mt-2 rounded-[var(--r-md)] overflow-hidden shadow-sm" style={{ border: '1px solid var(--border-default)' }}>
                    <div className="px-4 py-2 text-[11px] font-bold tracking-wider uppercase flex items-center justify-between" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <span>Generated SQL</span>
                    </div>
                    <div className="h-[150px]">
                      <Editor height="100%" defaultLanguage="sql" theme="vs-dark" value={msg.sql}
                        options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 13, padding: { top: 12, bottom: 12 } }} />
                    </div>
                  </div>
                )}
                {msg.results && msg.chartType && (
                  <div className="w-full mt-3 p-4 rounded-[var(--r-lg)] shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                    <ChartWidget data={msg.results} type={msg.chartType as any} xAxisKey={msg.chartConfig?.xAxisKey || "name"} />
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                  <User className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4">
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm text-[14px] shadow-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
              Thinking<span className="animate-pulse">...</span>
            </div>
          </div>
        )}
        <div ref={endOfChatRef} />
      </div>

      {/* Input */}
      <div className="p-5 relative" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <textarea value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Ask a question about your data..."
          style={{ background: 'var(--bg-base)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
          className="w-full rounded-[var(--r-md)] pl-5 pr-14 py-4 text-[14.5px] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-glow)] resize-none min-h-[56px] max-h-[160px] placeholder-[#64748b] transition-all shadow-sm"
          rows={1} disabled={isLoading} />
        <button onClick={() => { submitQuery(inputQuery); setInputQuery(""); }} disabled={!inputQuery.trim() || isLoading}
          className="absolute right-7 bottom-7 p-2.5 rounded-md transition-all btn-primary hover:-translate-y-0.5"
          style={{ padding: '8px 12px' }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
