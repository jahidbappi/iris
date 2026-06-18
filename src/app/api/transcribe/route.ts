import { NextRequest, NextResponse } from "next/server";
import { mockTranscription } from "@/lib/ai/mock";
import { getOpenAI, isDemoMode } from "@/lib/ai/providers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({
        text: mockTranscription(),
        demo: true,
        latencyMs: 600,
      });
    }

    const openai = getOpenAI();
    if (!openai || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Invalid audio input" }, { status: 400 });
    }

    const start = Date.now();
    const file = new File([audio], "audio.webm", { type: audio.type || "audio/webm" });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    return NextResponse.json({
      text: transcription.text,
      latencyMs: Date.now() - start,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
