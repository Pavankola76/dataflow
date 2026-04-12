"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";

interface CronBuilderProps {
  value?: string;
  onChange?: (cron: string) => void;
}

const presets = [
  { label: "Every 5 min", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every 6 hours", cron: "0 */6 * * *" },
  { label: "Daily midnight", cron: "0 0 * * *" },
  { label: "Daily 6 AM", cron: "0 6 * * *" },
  { label: "Weekly Monday", cron: "0 0 * * 1" },
  { label: "Monthly 1st", cron: "0 0 1 * *" },
];

export const CronBuilder: React.FC<CronBuilderProps> = ({ value = "0 * * * *", onChange }) => {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [customCron, setCustomCron] = useState(value);

  const handlePresetClick = (cron: string) => {
    setCustomCron(cron);
    onChange?.(cron);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCron(e.target.value);
    onChange?.(e.target.value);
  };

  const describeCron = (cron: string): string => {
    const match = presets.find(p => p.cron === cron);
    if (match) return match.label;
    const parts = cron.split(" ");
    if (parts.length !== 5) return "Custom schedule";
    return `min:${parts[0]} hr:${parts[1]} dom:${parts[2]} mon:${parts[3]} dow:${parts[4]}`;
  };

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-indigo-400" />
        <span className="text-[13px] font-semibold text-zinc-200">Schedule</span>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-3">
        {(["preset", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              mode === m
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "bg-zinc-800/50 text-zinc-500 border border-zinc-700/30"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {mode === "preset" ? (
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.cron}
              onClick={() => handlePresetClick(p.cron)}
              className={`px-3 py-2 rounded-lg text-[12px] text-left transition-all ${
                customCron === p.cron
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-zinc-800/30 text-zinc-400 border border-zinc-700/30 hover:text-zinc-200 hover:border-zinc-600/50"
              }`}
            >
              <div className="font-medium">{p.label}</div>
              <div className="text-[10px] text-zinc-600 font-mono mt-0.5">{p.cron}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={customCron}
            onChange={handleCustomChange}
            placeholder="* * * * *"
            className="w-full px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700/50 text-zinc-200 font-mono text-[13px] focus:outline-none focus:border-indigo-500/50"
          />
          <div className="mt-2 text-[11px] text-zinc-500">
            Format: <span className="font-mono text-zinc-400">minute hour day-of-month month day-of-week</span>
          </div>
        </div>
      )}

      <div className="mt-3 px-3 py-2 rounded-lg bg-indigo-500/[0.05] border border-indigo-500/10">
        <span className="text-[11px] text-indigo-300">{describeCron(customCron)}</span>
      </div>
    </div>
  );
};
