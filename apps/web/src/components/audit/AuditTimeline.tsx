"use client";

import React from "react";
import { Bot, User, GitBranch, Database, Shield, Wrench } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "ai_action" | "user_action" | "pipeline_event" | "schema_change" | "governance" | "system";
  title: string;
  description?: string;
  actor: string;
  timestamp: string;
}

interface AuditTimelineProps {
  events: TimelineEvent[];
}

const typeConfig = {
  ai_action:       { icon: Bot,       color: "text-indigo-400", dot: "bg-indigo-400" },
  user_action:     { icon: User,      color: "text-blue-400",   dot: "bg-blue-400" },
  pipeline_event:  { icon: GitBranch, color: "text-emerald-400", dot: "bg-emerald-400" },
  schema_change:   { icon: Database,  color: "text-amber-400",  dot: "bg-amber-400" },
  governance:      { icon: Shield,    color: "text-purple-400", dot: "bg-purple-400" },
  system:          { icon: Wrench,    color: "text-zinc-400",   dot: "bg-zinc-400" },
};

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-zinc-800" />

      <div className="space-y-4">
        {events.map((event) => {
          const config = typeConfig[event.type] || typeConfig.system;
          const Icon = config.icon;
          return (
            <div key={event.id} className="relative flex items-start gap-4 pl-1">
              {/* Dot */}
              <div className={`relative z-10 mt-1 w-[10px] h-[10px] rounded-full ${config.dot} ring-[3px] ring-zinc-900 shrink-0`} />

              {/* Content */}
              <div className="flex-1 -mt-0.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  <span className="text-[13px] font-medium text-zinc-200">{event.title}</span>
                </div>
                {event.description && (
                  <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{event.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-zinc-600">{event.actor}</span>
                  <span className="text-[10px] text-zinc-700">·</span>
                  <span className="text-[10px] text-zinc-600">{event.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
