import { hasOpenAI, hasReplicate, isDemoMode } from "@/lib/ai/providers";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    demoMode: isDemoMode(),
    hasOpenAI: hasOpenAI(),
    hasReplicate: hasReplicate(),
  });
}
