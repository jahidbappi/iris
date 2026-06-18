# How I Built the Iris Real-Time Multimodal Pipeline

An engineering deep-dive for portfolio reviewers and interview discussions.

## Problem

Build a voice + vision creative studio where perceived latency stays under one second, every modality streams visibly, and cost is measurable per session — not a static chatbot demo.

## Architecture

```
User (mic + camera)
    │
    ▼
┌─────────────────────────────────────┐
│  Next.js Studio (client)            │
│  - VisionPanel captures frames      │
│  - VoiceControl records audio       │
│  - Zustand session store            │
└──────────────┬──────────────────────┘
               │ POST /api/stream (SSE)
               ▼
┌─────────────────────────────────────┐
│  Orchestrator                       │
│  1. GPT-4o + tool calling           │
│  2. generate_image / edit_image     │
│  3. describe_scene (vision)         │
└──────────────┬──────────────────────┘
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
  Whisper   SDXL/     OpenAI
  (ASR)     DALL-E     (TTS)
```

## Key design decisions

### 1. SSE over WebSockets

Server-Sent Events fit the one-way streaming pattern (server → client) for tool calls, image URLs, and final responses. Simpler to deploy on Vercel than persistent WebSocket connections.

### 2. Optimistic UI + thinking states

The client shows "Iris is composing..." immediately on submit. Events stream in (`thinking` → `tool_call` → `image` → `response`) so users see progress even when image generation takes 2–4 seconds.

### 3. Demo mode without API keys

`isDemoMode()` checks for `OPENAI_API_KEY`. Without it, mock orchestration returns realistic responses and Unsplash images — reviewers can try the full UX instantly.

### 4. Observability as a first-class feature

Every request records:
- Input/output tokens and estimated cost
- p50/p95 latency from a rolling window
- Per-event cost in the session timeline

This mirrors production AI systems where cost guardrails matter as much as quality.

### 5. Tool-calling over prompt hacking

Three explicit tools (`generate_image`, `edit_image`, `describe_scene`) let the LLM decide actions structurally instead of parsing free-form text — more reliable and easier to test.

## Latency budget (target)

| Stage | Target | Notes |
|-------|--------|-------|
| ASR | 300–800ms | Whisper API or browser fallback |
| LLM routing | 200–500ms | Streaming first token |
| Image gen | 1.5–4s | Show thinking state; don't block UI |
| TTS | 200–400ms | Stream or browser SpeechSynthesis |

**Perceived latency** stays low because the UI updates at each SSE event, not only at the end.

## Production extensions (roadmap)

- Postgres + pgvector for cross-session memory
- Redis rate limiting and response cache
- Modal GPU worker for dedicated image jobs (`worker/main.py` skeleton included)
- Sentry error tracking, PostHog analytics

## Try it

```bash
npm install && npm run dev
# Open http://localhost:3000/studio
```

No API keys required for demo mode.
