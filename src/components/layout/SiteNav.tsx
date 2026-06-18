import Link from "next/link";
import { Code2 } from "lucide-react";

const MOSAIC_URL = process.env.NEXT_PUBLIC_MOSAIC_URL ?? "https://mosaic-rag.vercel.app";

export function SiteNav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#07070d]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Iris
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <Link href="/studio" className="hover:text-white transition-colors">
            Studio
          </Link>
          <Link href="/observability" className="hover:text-white transition-colors">
            Observability
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <a href={MOSAIC_URL} className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
            Mosaic
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/jahidbappi/iris"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Code2 className="h-4 w-4" />
          </a>
          <Link
            href="/studio"
            className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400 transition-colors"
          >
            Launch Studio
          </Link>
        </div>
      </div>
    </header>
  );
}
