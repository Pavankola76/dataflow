"use client";

import React from "react";

interface ProfileChartProps {
  columnName: string;
  dataType: string;
  nullRate: number;
  distinctCount: number;
  totalCount: number;
  topValues?: { value: string; count: number }[];
  min?: number | string;
  max?: number | string;
  mean?: number;
}

export const ProfileChart: React.FC<ProfileChartProps> = ({
  columnName,
  dataType,
  nullRate,
  distinctCount,
  totalCount,
  topValues = [],
  min,
  max,
  mean,
}) => {
  const fillRate = Math.round((1 - nullRate) * 100);
  const uniqueness = totalCount > 0 ? Math.round((distinctCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-[14px] font-semibold text-zinc-100">{columnName}</h4>
          <span className="text-[11px] text-zinc-500 font-mono">{dataType}</span>
        </div>
      </div>

      {/* Fill Rate & Uniqueness Bars */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-zinc-400">Completeness</span>
            <span className="text-[11px] font-semibold text-zinc-300">{fillRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${fillRate >= 95 ? "bg-emerald-500" : fillRate >= 80 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${fillRate}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-zinc-400">Uniqueness</span>
            <span className="text-[11px] font-semibold text-zinc-300">{uniqueness}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${uniqueness}%` }} />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {min !== undefined && (
          <div className="text-center p-2 rounded-lg bg-zinc-900/50">
            <div className="text-[10px] text-zinc-500">Min</div>
            <div className="text-[12px] font-semibold text-zinc-300">{typeof min === "number" ? min.toLocaleString() : min}</div>
          </div>
        )}
        {max !== undefined && (
          <div className="text-center p-2 rounded-lg bg-zinc-900/50">
            <div className="text-[10px] text-zinc-500">Max</div>
            <div className="text-[12px] font-semibold text-zinc-300">{typeof max === "number" ? max.toLocaleString() : max}</div>
          </div>
        )}
        {mean !== undefined && (
          <div className="text-center p-2 rounded-lg bg-zinc-900/50">
            <div className="text-[10px] text-zinc-500">Mean</div>
            <div className="text-[12px] font-semibold text-zinc-300">{mean.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Top Values Distribution */}
      {topValues.length > 0 && (
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Top Values</span>
          <div className="mt-1 space-y-1">
            {topValues.slice(0, 5).map((tv, i) => {
              const pct = totalCount > 0 ? (tv.count / totalCount) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">{tv.value}</span>
                  <span className="text-[10px] text-zinc-600">{tv.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
