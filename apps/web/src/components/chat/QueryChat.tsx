"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAnalyticsStore } from "@/stores";
import { Send, User, Bot, Loader2, Code2, RefreshCw } from "lucide-react";
import { ChartWidget } from "../charts/ChartWidget";
import Editor from "@monaco-editor/react";

export const QueryChat = () => {
  const { messages, isLoading, error, submitQuery, clearHistory } = useAnalyticsStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    submitQuery(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl overflow-hidden" style={{ background: '#1b1b1f', border: '1px solid rgba(255,255,255,0.08)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#17171b' }}>
        <div>
          <h2 className="text-lg font-semibold text-[#f3f3f3] flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#0078D4]" />
            AI Analytics Assistant
          </h2>
          <p className="text-[13px] text-[#9d9d9d]">Ask questions in plain English to generate insights</p>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 border border-transparent hover:border-white/[0.08] rounded-md transition-colors flex items-center gap-2 text-[13px] font-medium"
          style={{ color: '#9d9d9d', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f3f3f3'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9d9d9d'; e.currentTarget.style.background = 'transparent'; }}
        >
          <RefreshCw className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: '#1b1b1f' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'assistant' && (
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,120,212,0.1)', border: '1px solid rgba(0,120,212,0.2)' }}
              >
                <Bot className="w-5 h-5 text-[#0078D4]" />
              </div>
            )}

            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div 
                className={`p-4 rounded-xl shadow-sm ${msg.role === 'user' ? 'text-white rounded-tr-sm' : 'text-[#f3f3f3] rounded-tl-sm'}`}
                style={{
                  background: msg.role === 'user' ? '#0078D4' : '#252529',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                  {msg.content}
                </div>

                {/* AI Generated Chart and SQL */}
                {msg.role === 'assistant' && msg.chartType && msg.results && (
                  <div className="mt-6 space-y-4">
                    
                    {/* Visual Chart */}
                    <div className="rounded-xl p-4" style={{ background: '#1b1b1f', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <ChartWidget chartType={msg.chartType} config={msg.chartConfig} data={msg.results} />
                    </div>

                    {/* SQL View */}
                    {msg.sql && (
                       <details className="group rounded-md overflow-hidden" style={{ background: '#1b1b1f', border: '1px solid rgba(255,255,255,0.08)' }}>
                         <summary className="px-4 py-3 cursor-pointer text-[13px] font-medium text-[#cccccc] flex items-center gap-2 select-none hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                           <Code2 className="w-4 h-4 text-[#0078D4]" />
                           View Generated SQL
                         </summary>
                         <div className="h-[200px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                           <Editor
                             height="100%"
                             defaultLanguage="sql"
                             theme="vs-dark"
                             value={msg.sql}
                             options={{
                               readOnly: true,
                               minimap: { enabled: false },
                               scrollBeyondLastLine: false,
                               fontSize: 13,
                               padding: { top: 12, bottom: 12 }
                             }}
                           />
                         </div>
                       </details>
                    )}
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 order-2" style={{ background: '#252529', border: '1px solid rgba(255,255,255,0.08)' }}>
                <User className="w-5 h-5 text-[#9d9d9d]" />
              </div>
            )}
            
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,120,212,0.1)', border: '1px solid rgba(0,120,212,0.2)' }}
            >
              <Bot className="w-5 h-5 text-[#0078D4]" />
            </div>
            <div className="p-4 rounded-xl rounded-tl-sm text-[#9d9d9d] flex items-center gap-3 text-[13px]" style={{ background: '#252529', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Loader2 className="w-4 h-4 animate-spin text-[#0078D4]" />
              Analyzing the physical schema to generate dimensions and visual aggregates...
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-4">
             <div 
               className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
               style={{ background: 'rgba(209,52,56,0.1)', border: '1px solid rgba(209,52,56,0.2)' }}
             >
              <Bot className="w-5 h-5 text-[#d13438]" />
            </div>
            <div className="p-4 rounded-xl rounded-tl-sm text-[#d13438] text-[13px]" style={{ background: 'rgba(209,52,56,0.05)', border: '1px solid rgba(209,52,56,0.15)' }}>
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 flex-shrink-0" style={{ background: '#17171b', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="E.g., What is our conversion rate over the last 30 days?"
            className="w-full text-[#f3f3f3] rounded-md pl-4 pr-14 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#0078D4] focus:border-[#0078D4] transition-all disabled:opacity-50 text-[13px]"
            style={{ background: '#1b1b1f', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2.5 rounded-md transition-colors flex items-center justify-center btn-primary"
            style={{ padding: '8px' }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <div className="text-center mt-3 text-[11px] text-[#6d6d6d]">
          The DataFlow AI Analytics engine translates text to executable SQL against your warehouse.
        </div>
      </div>

    </div>
  );
};
