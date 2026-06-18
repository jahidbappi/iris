import type { SessionMetrics } from "@/types";

const COST_RATES = {
  gpt4o_input_per_1k: 0.0025,
  gpt4o_output_per_1k: 0.01,
  whisper_per_minute: 0.006,
  tts_per_1k_chars: 0.015,
  image_gen: 0.04,
  gpu_second: 0.0004,
} as const;

export function createEmptyMetrics(): SessionMetrics {
  return {
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    gpuSeconds: 0,
    totalCostUsd: 0,
    requestCount: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    latencies: [],
  };
}

export function estimateTokenCost(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens / 1000) * COST_RATES.gpt4o_input_per_1k +
    (outputTokens / 1000) * COST_RATES.gpt4o_output_per_1k
  );
}

export function estimateImageCost(): number {
  return COST_RATES.image_gen;
}

export function estimateTtsCost(charCount: number): number {
  return (charCount / 1000) * COST_RATES.tts_per_1k_chars;
}

export function recordLatency(metrics: SessionMetrics, latencyMs: number): SessionMetrics {
  const latencies = [...metrics.latencies, latencyMs].slice(-100);
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;

  return {
    ...metrics,
    latencies,
    p50LatencyMs: p50,
    p95LatencyMs: p95,
    requestCount: metrics.requestCount + 1,
  };
}

export function mergeMetrics(
  metrics: SessionMetrics,
  update: Partial<SessionMetrics>
): SessionMetrics {
  const latencies = update.latencies ?? metrics.latencies;
  const sorted = [...latencies].sort((a, b) => a - b);

  return {
    ...metrics,
    ...update,
    latencies,
    p50LatencyMs: sorted[Math.floor(sorted.length * 0.5)] ?? 0,
    p95LatencyMs: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
  };
}

export { COST_RATES };
