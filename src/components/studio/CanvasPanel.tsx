"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { useSessionStore } from "@/lib/store/session-store";

export function CanvasPanel() {
  const currentImage = useSessionStore((s) => s.currentImage);
  const isThinking = useSessionStore((s) => s.isThinking);

  return (
    <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#12121a] to-[#0a0a10]">
      <AnimatePresence mode="wait">
        {currentImage ? (
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-full w-full"
          >
            <Image src={currentImage} alt="Generated visual" fill className="object-cover" unoptimized />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-full flex-col items-center justify-center gap-3 text-white/30"
          >
            <ImageIcon className="h-12 w-12" />
            <p className="text-sm">Your creation will appear here</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="rounded-full border border-violet-400/30 px-4 py-2 text-sm text-violet-200">
              Iris is composing...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
