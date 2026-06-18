import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/providers";
import { getRuntimeStatus } from "@/lib/ai/runtime-mode";

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "nova" } = (await request.json()) as { text: string; voice?: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const status = await getRuntimeStatus();
    if (status.mode !== "cloud") {
      return NextResponse.json({
        demo: status.mode === "demo",
        localOss: status.mode === "local-oss",
        text,
        message: "Use browser SpeechSynthesis (free, no API key)",
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
