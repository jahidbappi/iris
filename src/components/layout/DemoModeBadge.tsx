"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";

type RuntimeMode = "demo" | "local-oss" | "cloud";

type RuntimeStatus = {
  mode: RuntimeMode;
  ollamaModel?: string | null;
  freeStack?: {
    llm: string;
    asr: string;
    tts: string;
    imageGen: string;
  };
};

async function probeClientOllama(): Promise<boolean> {
  try {
    const res = await fetch("http://127.0.0.1:11434/api/tags", { signal: AbortSignal.timeout(800) });
    return res.ok;
  } catch {
    return false;
  }
}

export function DemoModeBadge() {
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [clientOllama, setClientOllama] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: RuntimeStatus) => setStatus(data))
      .catch(() => setStatus({ mode: "demo" }));

    void probeClientOllama().then(setClientOllama);
  }, []);

  if (!status || status.mode === "cloud") return null;

  const isLocal = status.mode === "local-oss";
  const showOllamaHint = status.mode === "demo" && clientOllama;

  return (
    <div className="group relative">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
          isLocal
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
            : "border-amber-400/30 bg-amber-400/10 text-amber-200"
        }`}
      >
        {isLocal ? "Local OSS" : "Demo Mode"}
        <Info className="h-3 w-3 opacity-70" aria-hidden />
      </span>
      <div
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#12121a] p-3 text-xs leading-relaxed text-white/70 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {isLocal ? (
          <>
            <p className="font-medium text-emerald-200">Local OSS — $0 stack</p>
            <ul className="mt-1.5 space-y-1">
              <li>LLM: {status.freeStack?.llm ?? `Ollama (${status.ollamaModel})`}</li>
              <li>ASR: {status.freeStack?.asr ?? "Web Speech API"}</li>
              <li>TTS: {status.freeStack?.tts ?? "Browser SpeechSynthesis"}</li>
              <li>Images: {status.freeStack?.imageGen ?? "Placeholder (see OSS.md for local SD)"}</li>
            </ul>
          </>
        ) : (
          <>
            <p className="font-medium text-amber-200">Zero-setup demo for recruiters</p>
            <p className="mt-1.5">
              Scripted mocks, browser TTS, and stock imagery. No API keys on Vercel.
            </p>
            {showOllamaHint && (
              <p className="mt-1.5 text-emerald-300">
                Ollama detected on your machine — run <code className="text-violet-300">npm run dev</code>{" "}
                locally for free live LLM via Local OSS mode.
              </p>
            )}
            <p className="mt-1.5">
              Full free stack:{" "}
              <code className="text-violet-300">ollama pull llama3.1:8b && ollama pull llava</code> — see OSS.md
            </p>
          </>
        )}
      </div>
    </div>
  );
}
