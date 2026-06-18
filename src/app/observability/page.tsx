import { MetricsDashboard } from "@/components/observability/MetricsDashboard";
import Link from "next/link";

export default function ObservabilityPage() {
  return (
    <div className="min-h-screen bg-[#07070d] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-violet-300/80 hover:text-violet-200">
          ← Iris
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Observability</h1>
        <p className="mt-2 text-white/50">
          Real-time cost, latency, and session metrics for the multimodal pipeline.
        </p>
        <div className="mt-8">
          <MetricsDashboard />
        </div>
      </div>
    </div>
  );
}
