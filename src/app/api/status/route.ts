import { getRuntimeStatus } from "@/lib/ai/runtime-mode";

export const runtime = "nodejs";

export async function GET() {
  const status = await getRuntimeStatus();
  return Response.json(status);
}
