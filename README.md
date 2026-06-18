# Iris

[![Iris CI](https://github.com/jahidbappi/iris/actions/workflows/ci.yml/badge.svg)](https://github.com/jahidbappi/iris/actions)
[![Website](https://img.shields.io/badge/website-iris--puce.vercel.app-violet?style=flat-square)](https://iris-puce.vercel.app)

**Real-time multimodal voice + vision AI studio.**

**Live website:** https://iris-puce.vercel.app · **Studio:** https://iris-puce.vercel.app/studio

Iris lets you speak naturally to an AI creative director that sees through your camera, generates and edits visuals in real time, and narrates results back with voice — with production-grade streaming, cost guardrails, and observability.

## Architecture

```mermaid
flowchart LR
  User[User Voice + Vision] --> Web[Next.js Studio]
  Web --> ASR[Whisper ASR]
  Web --> Stream[SSE Stream API]
  Stream --> Orch[LLM Orchestrator]
  Orch --> Tools[Tool Calling]
  Tools --> ImageGen[SDXL / DALL-E]
  Orch --> TTS[TTS Narration]
  Web --> Obs[Observability Dashboard]
```

## Features

- Push-to-talk and text input with streaming transcription
- Camera, screen share, and image upload vision input
- Tool-calling LLM for generate / edit / describe decisions
- SSE streaming pipeline with visible thinking states
- Session replays with shareable links
- Cost, latency, and token observability dashboard
- Demo mode (no API keys required)

## Quick Start

```bash
cp .env.example .env.local   # optional API keys
npm install
npm run dev
```

**Live demo:** [https://iris-puce.vercel.app](https://iris-puce.vercel.app)

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables GPT-4o, Whisper, TTS, DALL-E |
| `REPLICATE_API_TOKEN` | No | Enables SDXL image generation |
| `OPENAI_MODEL` | No | Default `gpt-4o` |

Without keys, Iris runs in **demo mode** with scripted mock responses, browser TTS, and placeholder imagery — useful for UI exploration only.

### Real API mode (production)

Set `OPENAI_API_KEY` (and optionally `REPLICATE_API_TOKEN`) in `.env.local` or your Vercel project settings:

| Capability | Provider | Notes |
|------------|----------|-------|
| Speech-to-text | OpenAI Whisper | Live microphone transcription |
| Orchestration | GPT-4o | Tool calling for generate / edit / describe |
| Text-to-speech | OpenAI TTS | Streamed narration |
| Image generation | DALL-E 3 or Replicate SDXL | Real generated visuals (no stock placeholders) |
| Vision | GPT-4o | Camera, screen share, and upload analysis |

Demo mode never sends audio or images to external APIs. Real mode uses your keys and bills per provider usage — see `/observability` for per-session cost and latency.

## Deploy

```bash
# Vercel
vercel deploy
```

GPU worker (optional): deploy `worker/` to Modal or Fly.io for dedicated image jobs.

## Project Structure

```
src/
├── app/              # Pages + API routes
├── components/       # Studio UI
├── lib/ai/           # Orchestrator, tools, providers
├── lib/observability/
└── lib/store/        # Session state
worker/               # FastAPI GPU worker skeleton
```

## License

MIT
