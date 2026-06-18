export function Architecture() {
  const steps = [
    "User speaks + shares vision frame",
    "Whisper ASR transcribes audio",
    "GPT-4o orchestrator routes via tool calling",
    "SDXL / DALL-E generates or edits visuals",
    "TTS narrates results back to user",
  ];

  return (
    <section className="border-t border-white/5 bg-[#050508] px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-300/80">Architecture</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">Real-time multimodal pipeline</h2>
        <ol className="mt-12 space-y-4 text-left">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-medium text-violet-300">
                {i + 1}
              </span>
              <span className="text-white/70">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
