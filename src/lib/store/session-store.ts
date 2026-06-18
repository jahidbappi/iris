import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, SessionEvent, SessionMetrics, SessionSnapshot } from "@/types";
import { createEmptyMetrics, mergeMetrics, recordLatency } from "@/lib/observability/metrics";

interface SessionState {
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  events: SessionEvent[];
  metrics: SessionMetrics;
  visionFrame: string | null;
  currentImage: string | null;
  isThinking: boolean;
  isListening: boolean;
  snapshots: SessionSnapshot[];

  setVisionFrame: (frame: string | null) => void;
  setCurrentImage: (url: string | null) => void;
  setThinking: (value: boolean) => void;
  setListening: (value: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  addEvent: (event: Omit<SessionEvent, "id" | "timestamp">) => void;
  updateMetrics: (update: Partial<SessionMetrics>, latencyMs?: number) => void;
  resetSession: () => void;
  saveSnapshot: () => SessionSnapshot;
}

function newId(): string {
  return crypto.randomUUID();
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: newId(),
      title: "Untitled Session",
      messages: [],
      events: [],
      metrics: createEmptyMetrics(),
      visionFrame: null,
      currentImage: null,
      isThinking: false,
      isListening: false,
      snapshots: [],

      setVisionFrame: (frame) => set({ visionFrame: frame }),
      setCurrentImage: (url) => set({ currentImage: url }),
      setThinking: (value) => set({ isThinking: value }),
      setListening: (value) => set({ isListening: value }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
          title:
            state.messages.length === 0 && message.role === "user"
              ? message.content.slice(0, 48)
              : state.title,
        })),

      addEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              id: newId(),
              timestamp: Date.now(),
            },
          ],
        })),

      updateMetrics: (update, latencyMs) =>
        set((state) => {
          let metrics = mergeMetrics(state.metrics, update);
          if (latencyMs !== undefined) {
            metrics = recordLatency(metrics, latencyMs);
          }
          return { metrics };
        }),

      resetSession: () =>
        set({
          sessionId: newId(),
          title: "Untitled Session",
          messages: [],
          events: [],
          metrics: createEmptyMetrics(),
          visionFrame: null,
          currentImage: null,
          isThinking: false,
          isListening: false,
        }),

      saveSnapshot: () => {
        const state = get();
        const snapshot: SessionSnapshot = {
          id: state.sessionId,
          title: state.title,
          events: state.events,
          metrics: state.metrics,
          createdAt: Date.now(),
          shareUrl: `/replay/${state.sessionId}`,
        };
        set({ snapshots: [snapshot, ...state.snapshots].slice(0, 20) });
        return snapshot;
      },
    }),
    {
      name: "iris-session-store",
      partialize: (state) => ({
        snapshots: state.snapshots,
        sessionId: state.sessionId,
        title: state.title,
        events: state.events,
        metrics: state.metrics,
        messages: state.messages,
        currentImage: state.currentImage,
      }),
    }
  )
);
