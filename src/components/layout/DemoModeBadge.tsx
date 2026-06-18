"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";

type Status = {
  demoMode: boolean;
  hasOpenAI: boolean;
  hasReplicate: boolean;
};

export function DemoModeBadge() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: Status) => setStatus(data))
      .catch(() => setStatus({ demoMode: true, hasOpenAI: false, hasReplicate: false }));
  }, []);

  if (!status?.demoMode) return null;

  return (
    <div className="group relative">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
        Demo Mode
        <Info className="h-3 w-3 text-amber-300/70" aria-hidden />
      </span>
      <div
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-white/10 bg-[#12121a] p-3 text-xs leading-relaxed text-white/70 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <p className="font-medium text-amber-200">Free demo — no API keys required</p>
        <p className="mt-1.5">
          Responses use scripted mocks, browser TTS, and stock imagery. Nothing is sent to OpenAI or
          Replicate on Vercel.
        </p>
        <p className="mt-1.5">
          For live GPT-4o, Whisper, DALL-E, and SDXL, add keys to{" "}
          <code className="text-violet-300">.env.local</code> when running locally.
        </p>
      </div>
    </div>
  );
}
