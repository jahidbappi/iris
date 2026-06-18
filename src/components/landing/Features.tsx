"use client";

import { motion } from "framer-motion";
import { Mic, Eye, Zap, BarChart3, Share2, Layers } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-first interaction",
    description: "Push-to-talk with Whisper transcription and natural TTS narration of results.",
  },
  {
    icon: Eye,
    title: "Live vision input",
    description: "Camera, screen share, or image upload — Iris sees what you see.",
  },
  {
    icon: Zap,
    title: "Streaming pipeline",
    description: "SSE events stream thinking states, tool calls, and visuals with sub-second perceived latency.",
  },
  {
    icon: Layers,
    title: "Tool-calling LLM",
    description: "GPT-4o decides when to generate, edit, or describe — no prompt hacking.",
  },
  {
    icon: BarChart3,
    title: "Production observability",
    description: "Track tokens, cost per session, p50/p95 latency, and GPU seconds in real time.",
  },
  {
    icon: Share2,
    title: "Shareable replays",
    description: "Save and share creative sessions with public replay links.",
  },
];

export function Features() {
  return (
    <section className="border-t border-white/5 bg-[#07070d] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-violet-300/80">Capabilities</p>
        <h2 className="mt-4 text-center text-3xl font-semibold text-white md:text-4xl">
          Built like a real product, not a tutorial
        </h2>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-6"
            >
              <f.icon className="h-6 w-6 text-violet-400" />
              <h3 className="mt-4 text-lg font-medium text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
