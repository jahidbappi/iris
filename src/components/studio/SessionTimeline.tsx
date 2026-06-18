"use client";

import { motion } from "framer-motion";
import { useSessionStore } from "@/lib/store/session-store";
import { formatCost, formatLatency } from "@/lib/utils";

export function SessionTimeline() {
  const events = useSessionStore((s) => s.events);

  if (events.length === 0) {
    return <p className="text-sm text-white/40">Session events will stream here.</p>;
  }

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-violet-300/70">{event.type}</span>
            <span className="text-xs text-white/30">
              {event.latencyMs !== undefined && formatLatency(event.latencyMs)}
              {event.costUsd !== undefined && ` · ${formatCost(event.costUsd)}`}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/70">{event.content}</p>
        </motion.div>
      ))}
    </div>
  );
}
