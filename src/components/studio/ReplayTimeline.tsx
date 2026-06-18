"use client";

import type { SessionEvent } from "@/types";
import { formatCost, formatLatency } from "@/lib/utils";

export function ReplayTimeline({ events }: { events: SessionEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-white/40">No events in this replay.</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-violet-300/70">{event.type}</span>
            <span className="text-xs text-white/30">
              {event.latencyMs !== undefined && formatLatency(event.latencyMs)}
              {event.costUsd !== undefined && ` · ${formatCost(event.costUsd)}`}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/70">{event.content}</p>
        </div>
      ))}
    </div>
  );
}
