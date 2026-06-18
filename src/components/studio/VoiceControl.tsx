"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/store/session-store";

type RuntimeMode = "demo" | "local-oss" | "cloud";

type RuntimeStatus = {
  mode: RuntimeMode;
  ollamaModel?: string | null;
};

interface VoiceControlProps {
  onSubmit: (text: string) => Promise<void>;
}

type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceControl({ onSubmit }: VoiceControlProps) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [runtime, setRuntime] = useState<RuntimeStatus>({ mode: "demo" });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isListening = useSessionStore((s) => s.isListening);
  const setListening = useSessionStore((s) => s.setListening);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: RuntimeStatus) => setRuntime(data))
      .catch(() => setRuntime({ mode: "demo" }));
  }, []);

  const useFreeAsr = runtime.mode !== "cloud" && getSpeechRecognition() !== null;

  async function startWebSpeech() {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return startMediaRecorder();

    const recognition = new SpeechRecognition();
    speechRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setText(transcript);
        void onSubmit(transcript);
      }
    };

    recognition.onerror = () => {
      setRecording(false);
      setListening(false);
    };

    recognition.onend = () => {
      setRecording(false);
      setListening(false);
    };

    setRecording(true);
    setListening(true);
    recognition.start();
  }

  async function startMediaRecorder() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      setListening(false);

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob);
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = (await res.json()) as { text?: string; error?: string };
      if (data.text) {
        setText(data.text);
        await onSubmit(data.text);
      }
    };
    recorder.start();
    setRecording(true);
    setListening(true);
  }

  async function startRecording() {
    if (useFreeAsr) {
      await startWebSpeech();
    } else {
      await startMediaRecorder();
    }
  }

  function stopRecording() {
    speechRef.current?.stop();
    mediaRecorderRef.current?.stop();
  }

  async function handleTextSubmit() {
    if (!text.trim()) return;
    const value = text.trim();
    setText("");
    await onSubmit(value);
  }

  return (
    <div className="space-y-4">
      {runtime.mode === "local-oss" && (
        <p className="text-xs text-emerald-300/80">
          Free ASR via Web Speech API · LLM via Ollama ({runtime.ollamaModel ?? "local"})
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant={recording ? "default" : "secondary"}
          onClick={recording ? stopRecording : startRecording}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 text-sm text-violet-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
              </span>
              Listening{useFreeAsr ? " (browser ASR)" : ""}...
            </motion.div>
          )}
        </AnimatePresence>
        {runtime.mode === "demo" && useFreeAsr && (
          <span className="text-xs text-white/40">Free browser ASR available</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleTextSubmit()}
          placeholder="Describe what you want Iris to create..."
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-400/50"
        />
        <Button onClick={() => void handleTextSubmit()} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
