"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface QualityBadgeProps {
  score: number; // 0-100
  label?: string;
  size?: "sm" | "md";
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ score, label, size = "sm" }) => {
  const getConfig = () => {
    if (score >= 90) return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Excellent" };
    if (score >= 70) return { icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Good" };
    if (score >= 50) return { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Fair" };
    return { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Poor" };
  };

  const config = getConfig();
  const Icon = config.icon;
  const isSmall = size === "sm";

  return (
    <div className={`inline-flex items-center gap-1.5 ${isSmall ? "px-2 py-0.5" : "px-3 py-1"} rounded-full ${config.bg} border ${config.border}`}>
      <Icon className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} ${config.color}`} />
      <span className={`${isSmall ? "text-[10px]" : "text-[11px]"} font-semibold ${config.color}`}>
        {label || config.label} {score}%
      </span>
    </div>
  );
};

interface FreshnessBadgeProps {
  lastRefreshed: string | null; // ISO timestamp
  slaHours?: number;
  size?: "sm" | "md";
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({ lastRefreshed, slaHours = 24, size = "sm" }) => {
  const getAge = () => {
    if (!lastRefreshed) return { hours: Infinity, label: "Never refreshed" };
    const diff = Date.now() - new Date(lastRefreshed).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 1) return { hours, label: `${Math.round(diff / 60000)}m ago` };
    if (hours < 24) return { hours, label: `${Math.round(hours)}h ago` };
    return { hours, label: `${Math.round(hours / 24)}d ago` };
  };

  const age = getAge();
  const isStale = age.hours > slaHours;
  const isWarning = age.hours > slaHours * 0.75;
  const isSmall = size === "sm";

  const config = isStale
    ? { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" }
    : isWarning
    ? { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
    : { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 ${isSmall ? "px-2 py-0.5" : "px-3 py-1"} rounded-full ${config.bg} border ${config.border}`}>
      <Icon className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} ${config.color}`} />
      <span className={`${isSmall ? "text-[10px]" : "text-[11px]"} font-semibold ${config.color}`}>
        {age.label}
      </span>
    </div>
  );
};
