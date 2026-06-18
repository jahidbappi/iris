# Iris Demo Video Script

Record a **2–3 minute** portfolio demo. Iris runs in demo mode on Vercel with no API keys — perfect for screen recording.

## Setup (5 min)

1. Open **https://iris-puce.vercel.app** (or `npm run dev` locally)
2. Confirm **Demo Mode** badge appears in the studio nav
3. Resize browser to **1440×900** (or 1280×800)
4. Close unrelated tabs; use dark desktop wallpaper for polish
5. Optional: enable camera permissions before recording

## Shot list

| Time | Scene | Action / narration cue |
|------|-------|------------------------|
| 0:00 | Landing | Pan hero — "See. Speak. Create." Highlight live demo link |
| 0:20 | About | Scroll architecture section — mention SSE streaming + demo mode |
| 0:35 | Studio | Click **Launch Studio** — point out **Demo Mode** badge and tooltip |
| 0:45 | Vision | Enable camera or upload an image — "Iris sees your frame" |
| 1:00 | Voice | Push-to-talk or type: *"Generate a minimalist poster with deep indigo gradients"* |
| 1:15 | Pipeline | Show thinking state → timeline events (tool call, image, TTS) |
| 1:30 | Canvas | Zoom result on canvas — mention placeholder imagery in demo |
| 1:45 | Observability | Open `/observability` — walk through cost, P50/P95, latency breakdown |
| 2:00 | Replay | Back to studio → **Share Replay** → open link in new tab |
| 2:15 | Close | GitHub link — "Add API keys locally for live GPT-4o and SDXL" |

## Talking points (pick 2–3)

- **Product craft:** multimodal studio with voice, vision, and image generation in one flow
- **Systems:** SSE streaming exposes each pipeline stage to the user
- **Production:** observability dashboard with estimated cost and latency breakdown
- **Demo mode:** reviewers can try the full UX without API keys or billing

## Recording tips

- Speak slowly; pause on UI transitions
- Use macOS QuickTime or OBS (free)
- Export MP4, 1080p if possible
- Upload to GitHub README, LinkedIn, or Loom

## Live API mode (optional B-roll)

If you have keys locally:

```bash
cp .env.example .env.local
# Add OPENAI_API_KEY and optionally REPLICATE_API_TOKEN
npm run dev
```

Show real Whisper transcription and generated images — contrast with demo placeholders.

## Checklist before publish

- [ ] Demo Mode badge visible in recording
- [ ] At least one full generate flow in timeline
- [ ] Observability page shows non-zero metrics
- [ ] Replay link works in incognito window
