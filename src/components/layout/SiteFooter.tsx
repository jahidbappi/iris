import Link from "next/link";

const IRIS_URL = process.env.NEXT_PUBLIC_IRIS_URL ?? "https://iris-puce.vercel.app";
const MOSAIC_URL = process.env.NEXT_PUBLIC_MOSAIC_URL ?? "https://mosaic-rag.vercel.app";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#050508] px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-white">Iris</p>
          <p className="mt-2 text-sm text-white/50">
            Real-time multimodal voice + vision AI studio. Built by{" "}
            <a href="https://github.com/jahidbappi" className="text-violet-300 hover:underline">
              Md. Jahidul Islam
            </a>
            .
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li><Link href="/studio" className="hover:text-white">Studio</Link></li>
            <li><Link href="/observability" className="hover:text-white">Observability</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Portfolio</p>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>
              <a href={MOSAIC_URL} className="hover:text-white" target="_blank" rel="noopener noreferrer">
                Mosaic — Multimodal RAG
              </a>
            </li>
            <li>
              <a href="https://github.com/jahidbappi/iris" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                Source Code
              </a>
            </li>
            <li>
              <a href={IRIS_URL} className="hover:text-white">{IRIS_URL.replace("https://", "")}</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-white/30">
        MIT License · AI Engineer Portfolio Project
      </p>
    </footer>
  );
}
