import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-[#07070d] px-6 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300/80">About Iris</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            A creative director that sees, listens, and creates
          </h1>
          <div className="mt-8 space-y-6 text-lg text-white/60 leading-relaxed">
            <p>
              Iris is a production-grade multimodal AI studio built for AI Engineer portfolios.
              It combines voice input, live vision, LLM tool calling, image generation, and TTS
              narration in a single streaming pipeline — with real cost and latency observability.
            </p>
            <p>
              Demo mode runs entirely on Vercel without API keys: scripted orchestration, browser TTS,
              and placeholder imagery. Add keys locally for live GPT-4o, Whisper, DALL-E, and SDXL.
            </p>
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-white">Architecture</h2>
            <p className="mt-2 text-sm text-white/50">
              Server-Sent Events stream each pipeline stage to the client in real time.
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <pre className="text-sm leading-relaxed text-white/70">
{`flowchart LR
  User[Voice + Vision] --> Studio[Next.js Studio]
  Studio --> ASR[Whisper ASR]
  Studio --> SSE[SSE Stream API]
  SSE --> Orch[LLM Orchestrator]
  Orch --> Tools[Tool Calling]
  Tools --> Img[SDXL / DALL-E]
  Orch --> TTS[TTS Narration]
  Studio --> Obs[Observability]`}
              </pre>
              <p className="mt-3 text-xs text-white/40">
                Mermaid diagram (render on GitHub README). Tools:{" "}
                <code className="text-violet-300">generate_image</code>,{" "}
                <code className="text-violet-300">edit_image</code>,{" "}
                <code className="text-violet-300">describe_scene</code>.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { title: "Streaming", desc: "SSE events for thinking, tool calls, images, and responses" },
                { title: "Demo mode", desc: "Full UX without API keys — ideal for portfolio reviewers" },
                { title: "Observability", desc: "Per-session cost, P50/P95 latency, stage breakdown" },
                { title: "Replays", desc: "Shareable session snapshots with timeline playback" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-10 text-sm text-white/40">
            Built with Next.js, TypeScript, OpenAI, and Replicate. Deployed on Vercel with GitHub Actions CI.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/studio" className="rounded-full bg-violet-500 px-6 py-3 text-sm font-medium hover:bg-violet-400">
              Try the Studio
            </Link>
            <Link href="/observability" className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/5">
              View Observability
            </Link>
            <a
              href="https://github.com/jahidbappi/iris/blob/master/BLOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              Engineering Deep-Dive
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
