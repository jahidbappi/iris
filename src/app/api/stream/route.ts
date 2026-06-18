import { NextRequest } from "next/server";
import { orchestrate } from "@/lib/ai/orchestrator";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const body = (await request.json()) as {
    messages: ChatMessage[];
    visionFrame?: string;
    sessionId: string;
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("thinking", { status: "Analyzing request..." });
        await new Promise((r) => setTimeout(r, 300));

        const result = await orchestrate(body);

        for (const tool of result.toolResults) {
          send("tool_call", tool);
          await new Promise((r) => setTimeout(r, 150));
        }

        if (result.imageUrl) {
          send("image", { url: result.imageUrl });
        }

        send("response", {
          text: result.response,
          metrics: result.metrics,
        });
        send("done", { ok: true });
      } catch (error) {
        send("error", {
          message: error instanceof Error ? error.message : "Stream failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
