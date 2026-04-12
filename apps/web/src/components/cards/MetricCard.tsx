"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "red" | "purple" | "blue";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  indigo: { bg: "bg-indigo-500/[0.08]", border: "border-indigo-500/20", text: "text-indigo-400", glow: "shadow-indigo-500/5" },
  emerald: { bg: "bg-emerald-500/[0.08]", border: "border-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/5" },
  amber: { bg: "bg-amber-500/[0.08]", border: "border-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/5" },
  red: { bg: "bg-red-500/[0.08]", border: "border-red-500/20", text: "text-red-400", glow: "shadow-red-500/5" },
  purple: { bg: "bg-purple-500/[0.08]", border: "border-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/5" },
  blue: { bg: "bg-blue-500/[0.08]", border: "border-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/5" },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = "indigo",
  size = "md",
}) => {
  const c = colorMap[color];
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === undefined || change === 0;

  const sizeClasses = {
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  const valueClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl",
  };

  return (
    <div className={`rounded-xl ${c.bg} border ${c.border} ${sizeClasses[size]} ${c.glow} shadow-lg transition-all hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-zinc-400 uppercase tracking-wider">{title}</span>
        {icon && <div className={`${c.text} opacity-60`}>{icon}</div>}
      </div>
      <div className={`${valueClasses[size]} font-bold ${c.text} tracking-tight`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {isNeutral ? (
            <Minus className="w-3 h-3 text-zinc-500" />
          ) : isPositive ? (
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-[11px] font-semibold ${isNeutral ? "text-zinc-500" : isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive && "+"}{change}%
          </span>
          {changeLabel && <span className="text-[11px] text-zinc-600">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
};
