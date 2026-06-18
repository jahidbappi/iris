"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-violet-200"
        >
          <Sparkles className="h-4 w-4" />
          Real-time multimodal creative studio
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl"
        >
          See. Speak.{" "}
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            Create.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-white/60 md:text-xl"
        >
          Iris is a voice + vision AI studio that watches what you see, understands what you say,
          and generates cinematic visuals in real time — with production-grade latency and cost
          observability.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/studio">
            <Button size="lg">Open Studio</Button>
          </Link>
          <Link href="/observability">
            <Button size="lg" variant="secondary">
              View Observability
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-16 w-full max-w-5xl rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-1 shadow-2xl shadow-violet-950/40"
        >
          <div className="grid gap-1 rounded-[1.9rem] bg-[#0b0b12] p-6 md:grid-cols-3">
            {[
              { label: "Voice", value: "Streaming ASR + TTS" },
              { label: "Vision", value: "Camera, screen, upload" },
              { label: "Creation", value: "Generate & edit images" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-300/80">{item.label}</p>
                <p className="mt-2 text-lg font-medium text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
