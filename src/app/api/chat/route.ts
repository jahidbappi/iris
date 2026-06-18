import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/ai/orchestrator";
import type { ChatMessage } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages: ChatMessage[];
      visionFrame?: string;
      sessionId: string;
    };

    const result = await orchestrate({
      messages: body.messages,
      visionFrame: body.visionFrame,
      sessionId: body.sessionId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
