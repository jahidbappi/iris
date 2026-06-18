import { MetricsDashboard } from "@/components/observability/MetricsDashboard";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function ObservabilityPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      <SiteNav />
      <div className="mx-auto max-w-6xl px-6 py-8 pt-24">
        <h1 className="text-3xl font-semibold">Observability</h1>
        <p className="mt-2 text-white/50">
          Real-time cost, latency, and session metrics for the multimodal pipeline.
        </p>
        <div className="mt-8">
          <MetricsDashboard />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
