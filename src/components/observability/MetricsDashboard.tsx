"use client";

import { formatCost, formatLatency } from "@/lib/utils";
import { useSessionStore } from "@/lib/store/session-store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MetricsDashboard() {
  const metrics = useSessionStore((s) => s.metrics);
  const snapshots = useSessionStore((s) => s.snapshots);

  const cards = [
    { label: "Total Cost", value: formatCost(metrics.totalCostUsd) },
    { label: "Requests", value: String(metrics.requestCount) },
    { label: "Tokens", value: metrics.totalTokens.toLocaleString() },
    { label: "P50 Latency", value: formatLatency(metrics.p50LatencyMs) },
    { label: "P95 Latency", value: formatLatency(metrics.p95LatencyMs) },
    { label: "GPU Seconds", value: metrics.gpuSeconds.toFixed(2) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300/70">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-white">Saved Sessions</h2>
          <p className="text-sm text-white/50">Replay links for shareable creative sessions</p>
        </CardHeader>
        <CardContent>
          {snapshots.length === 0 ? (
            <p className="text-sm text-white/40">No saved sessions yet. Create one in the studio.</p>
          ) : (
            <div className="space-y-3">
              {snapshots.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{s.title}</p>
                    <p className="text-xs text-white/40">
                      {new Date(s.createdAt).toLocaleString()} · {formatCost(s.metrics.totalCostUsd)}
                    </p>
                  </div>
                  <a href={s.shareUrl} className="text-sm text-violet-300 hover:text-violet-200">
                    Replay
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
