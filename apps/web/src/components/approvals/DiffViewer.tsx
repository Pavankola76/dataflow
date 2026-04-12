"use client";

import React from "react";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber?: number;
}

interface DiffViewerProps {
  filename: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ filename, additions, deletions, lines }) => {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-elevated)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/50">
        <span className="text-[13px] font-mono text-zinc-300">{filename}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-400">+{additions}</span>
          {deletions > 0 && <span className="text-[11px] font-mono text-red-400">-{deletions}</span>}
        </div>
      </div>

      {/* Diff Lines */}
      <div className="font-mono text-[12px] leading-5 overflow-x-auto">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`flex ${
              line.type === "add"
                ? "bg-emerald-500/[0.06]"
                : line.type === "remove"
                ? "bg-red-500/[0.06]"
                : ""
            }`}
          >
            {/* Line number */}
            <span className="w-12 text-right pr-3 text-zinc-600 select-none shrink-0 border-r border-zinc-800/30 py-px">
              {line.lineNumber || ""}
            </span>
            {/* Indicator */}
            <span
              className={`w-5 text-center shrink-0 py-px ${
                line.type === "add" ? "text-emerald-400" : line.type === "remove" ? "text-red-400" : "text-zinc-600"
              }`}
            >
              {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
            </span>
            {/* Content */}
            <span
              className={`flex-1 px-2 py-px whitespace-pre ${
                line.type === "add" ? "text-emerald-300" : line.type === "remove" ? "text-red-300" : "text-zinc-400"
              }`}
            >
              {line.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
