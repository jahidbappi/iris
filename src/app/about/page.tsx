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
              The architecture uses Server-Sent Events for one-way streaming, an orchestrator with
              explicit tools (<code className="text-violet-300">generate_image</code>,{" "}
              <code className="text-violet-300">edit_image</code>,{" "}
              <code className="text-violet-300">describe_scene</code>), and demo mode so reviewers
              can try the full experience without API keys.
            </p>
            <p>
              Built with Next.js 16, TypeScript, Framer Motion, OpenAI, and Replicate. Deployed on
              Vercel with GitHub Actions CI.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/studio" className="rounded-full bg-violet-500 px-6 py-3 text-sm font-medium hover:bg-violet-400">
              Try the Studio
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
