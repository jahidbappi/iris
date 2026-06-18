import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, isDemoMode } from "@/lib/ai/providers";

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "nova" } = (await request.json()) as { text: string; voice?: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (isDemoMode()) {
      return NextResponse.json({
        demo: true,
        text,
        message: "Use browser SpeechSynthesis in demo mode",
      });
    }

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json({ demo: true, text });
    }

    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text.slice(0, 4096),
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
