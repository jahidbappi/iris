"use client";

import Link from "next/link";
import { RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VisionPanel } from "@/components/studio/VisionPanel";
import { VoiceControl } from "@/components/studio/VoiceControl";
import { CanvasPanel } from "@/components/studio/CanvasPanel";
import { SessionTimeline } from "@/components/studio/SessionTimeline";
import { useSessionStore } from "@/lib/store/session-store";
import { formatCost } from "@/lib/utils";

async function speakText(text: string) {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (res.headers.get("Content-Type")?.includes("audio")) {
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
    return;
  }

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}

export default function StudioPage() {
  const sessionId = useSessionStore((s) => s.sessionId);
  const messages = useSessionStore((s) => s.messages);
  const visionFrame = useSessionStore((s) => s.visionFrame);
  const metrics = useSessionStore((s) => s.metrics);
  const addMessage = useSessionStore((s) => s.addMessage);
  const addEvent = useSessionStore((s) => s.addEvent);
  const setThinking = useSessionStore((s) => s.setThinking);
  const setCurrentImage = useSessionStore((s) => s.setCurrentImage);
  const updateMetrics = useSessionStore((s) => s.updateMetrics);
  const resetSession = useSessionStore((s) => s.resetSession);
  const saveSnapshot = useSessionStore((s) => s.saveSnapshot);

  async function handleSubmit(text: string) {
    addMessage({ role: "user", content: text });
    addEvent({ type: "transcription", content: text });
    setThinking(true);
    addEvent({ type: "thinking", content: "Orchestrating multimodal pipeline..." });

    const payload = {
      messages: [...messages, { role: "user" as const, content: text }],
      visionFrame: visionFrame ?? undefined,
      sessionId,
    };

    const res = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalResponse = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          const eventLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace("event: ", "").trim();
          const data = JSON.parse(dataLine.replace("data: ", "")) as Record<string, unknown>;

          if (event === "tool_call") {
            addEvent({
              type: "tool_call",
              content: String(data.tool ?? "tool"),
              latencyMs: Number(data.latencyMs ?? 0),
              costUsd: Number(data.costUsd ?? 0),
            });
            if (data.imageUrl) {
              setCurrentImage(String(data.imageUrl));
              addEvent({
                type: "image_generated",
                content: "Visual generated",
                imageUrl: String(data.imageUrl),
              });
            }
          }

          if (event === "image" && data.url) {
            setCurrentImage(String(data.url));
          }

          if (event === "response") {
            finalResponse = String(data.text ?? "");
            const m = data.metrics as {
              inputTokens?: number;
              outputTokens?: number;
              latencyMs?: number;
              costUsd?: number;
            };
            updateMetrics(
              {
                inputTokens: metrics.inputTokens + (m.inputTokens ?? 0),
                outputTokens: metrics.outputTokens + (m.outputTokens ?? 0),
                totalTokens:
                  metrics.totalTokens + (m.inputTokens ?? 0) + (m.outputTokens ?? 0),
                totalCostUsd: metrics.totalCostUsd + (m.costUsd ?? 0),
              },
              m.latencyMs
            );
          }
        }
      }
    }

    setThinking(false);

    if (finalResponse) {
      addMessage({ role: "assistant", content: finalResponse });
      addEvent({ type: "response", content: finalResponse });
      await speakText(finalResponse);
      addEvent({ type: "tts", content: "Narrated response" });
    }
  }

  async function handleShare() {
    const snapshot = saveSnapshot();
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    if (snapshot.shareUrl) {
      await navigator.clipboard.writeText(`${window.location.origin}${snapshot.shareUrl}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#07070d] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-violet-300/80 hover:text-violet-200">
              ← Iris
            </Link>
            <h1 className="mt-2 text-3xl font-semibold">Creative Studio</h1>
            <p className="text-sm text-white/50">
              Session cost: {formatCost(metrics.totalCostUsd)} · {metrics.requestCount} requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => resetSession()}>
              <RotateCcw className="h-4 w-4" /> New Session
            </Button>
            <Button onClick={() => void handleShare()}>
              <Share2 className="h-4 w-4" /> Share Replay
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Vision Input</h2>
              </CardHeader>
              <CardContent>
                <VisionPanel />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Voice & Text</h2>
              </CardHeader>
              <CardContent>
                <VoiceControl onSubmit={handleSubmit} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium">Session Timeline</h2>
              </CardHeader>
              <CardContent>
                <SessionTimeline />
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit lg:sticky lg:top-8">
            <CardHeader>
              <h2 className="text-lg font-medium">Canvas</h2>
            </CardHeader>
            <CardContent>
              <CanvasPanel />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
