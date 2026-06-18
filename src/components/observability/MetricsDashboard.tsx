"use client";

import { formatCost, formatLatency } from "@/lib/utils";
import { useSessionStore } from "@/lib/store/session-store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SessionEventType } from "@/types";

const LATENCY_LABELS: Record<SessionEventType, string> = {
  transcription: "ASR (transcription)",
  thinking: "Orchestration (planning)",
  tool_call: "Tool execution (image/vision)",
  image_generated: "Image generation",
  image_edited: "Image edit",
  response: "LLM response",
  tts: "TTS narration",
  error: "Error handling",
};

function latencyBreakdown(events: { type: SessionEventType; latencyMs?: number }[]) {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const event of events) {
    if (event.latencyMs === undefined || event.latencyMs <= 0) continue;
    const label = LATENCY_LABELS[event.type] ?? event.type;
    const prev = buckets.get(label) ?? { total: 0, count: 0 };
    buckets.set(label, { total: prev.total + event.latencyMs, count: prev.count + 1 });
  }

  return [...buckets.entries()]
    .map(([label, { total, count }]) => ({
      label,
      avgMs: total / count,
      count,
    }))
    .sort((a, b) => b.avgMs - a.avgMs);
}

export function MetricsDashboard() {
  const metrics = useSessionStore((s) => s.metrics);
  const events = useSessionStore((s) => s.events);
  const snapshots = useSessionStore((s) => s.snapshots);
  const title = useSessionStore((s) => s.title);

  const breakdown = latencyBreakdown(events);

  const cards = [
    { label: "Session Cost", value: formatCost(metrics.totalCostUsd), hint: "Estimated (demo uses mock rates)" },
    { label: "Requests", value: String(metrics.requestCount), hint: "Completed orchestration runs" },
    { label: "Total Tokens", value: metrics.totalTokens.toLocaleString(), hint: `${metrics.inputTokens.toLocaleString()} in · ${metrics.outputTokens.toLocaleString()} out` },
    { label: "P50 Latency", value: formatLatency(metrics.p50LatencyMs), hint: "Median end-to-end" },
    { label: "P95 Latency", value: formatLatency(metrics.p95LatencyMs), hint: "Tail latency" },
    { label: "GPU Seconds", value: metrics.gpuSeconds.toFixed(2), hint: "Image worker time (live mode)" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-100/80">
        Metrics update live from your studio session — including demo mode. Costs are estimated from
        published provider rates, not actual billing.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300/70">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-1 text-xs text-white/40">{card.hint}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-white">Latency Breakdown</h2>
            <p className="text-sm text-white/50">Average per stage from session timeline events</p>
          </CardHeader>
          <CardContent>
            {breakdown.length === 0 ? (
              <p className="text-sm text-white/40">
                Run a request in the studio to populate stage latencies.
              </p>
            ) : (
              <div className="space-y-3">
                {breakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/80">{row.label}</p>
                      <p className="text-xs text-white/40">{row.count} event{row.count !== 1 ? "s" : ""}</p>
                    </div>
                    <p className="font-mono text-sm text-violet-300">{formatLatency(row.avgMs)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-white">Current Session</h2>
            <p className="text-sm text-white/50">{title}</p>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/50">Timeline events</dt>
                <dd className="font-mono text-white">{events.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Avg request latency</dt>
                <dd className="font-mono text-violet-300">
                  {metrics.requestCount > 0
                    ? formatLatency(
                        metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length
                      )
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Cost per request</dt>
                <dd className="font-mono text-white">
                  {metrics.requestCount > 0
                    ? formatCost(metrics.totalCostUsd / metrics.requestCount)
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
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
                      {new Date(s.createdAt).toLocaleString()} · {formatCost(s.metrics.totalCostUsd)} ·{" "}
                      {s.metrics.requestCount} req · P50 {formatLatency(s.metrics.p50LatencyMs)}
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
