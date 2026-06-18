# Iris — Best-in-Class Free / OSS Stack

Run Iris at **$0** with industry-standard open models. Three runtime modes:

| Mode | When | Cost |
|------|------|------|
| **Demo** | [iris-puce.vercel.app](https://iris-puce.vercel.app) — zero setup | $0 |
| **Local OSS** | Clone repo + Ollama | $0 |
| **Cloud** | Optional API keys | Pay-per-use |

## Recommended models (`ollama pull`)

```bash
# LLM — tool calling & orchestration (pick one)
ollama pull llama3.1:8b      # Meta Llama 3.1 — best general quality/speed (Dubey et al., 2024)
ollama pull qwen2.5:7b       # Alibaba Qwen 2.5 — strong multilingual alternative

# Vision — scene description via camera/upload
ollama pull llava            # LLaVA 1.6 — widely cited VLM (Liu et al., 2023)

# Optional embeddings (Mosaic integration)
ollama pull nomic-embed-text # Nomic AI — Apache 2.0 embedder
```

## Quick start (Local OSS)

```bash
ollama pull llama3.1:8b
ollama pull llava            # optional, for vision describe_scene

cd iris && npm install && npm run dev
# Studio shows "Local OSS" when Ollama health check passes
```

Default env (no `.env` required):

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_VISION_MODEL=llava
```

## Layer-by-layer (best OSS choices)

| Layer | Integrated | Documented | Model / library |
|-------|:----------:|:----------:|-----------------|
| **LLM** | ✓ | | [Ollama](https://ollama.com) + `llama3.1:8b` or `qwen2.5:7b` |
| **ASR** | ✓ (browser) | ✓ | **Web Speech API** (instant fallback); **faster-whisper** `distil-large-v3` or `large-v3-turbo` (Systran, 2024) for best accuracy — run local server |
| **TTS** | ✓ (browser) | ✓ | **SpeechSynthesis** fallback; **Piper** (Rhasspy) for offline high-quality TTS |
| **Vision/VLM** | ✓ | | **LLaVA** via Ollama (`llava`); Qwen2-VL when available in Ollama |
| **Image gen** | placeholders | ✓ | **FLUX.1-schnell** or **SDXL** via [diffusers](https://github.com/huggingface/diffusers) — not SD 1.5 |
| **Orchestration** | ✓ | | Existing tool-calling + Ollama adapter |

### ASR — faster-whisper (documented, local server)

Best accuracy/speed tradeoff for local ASR. Not bundled in Next.js (Python/CUDA):

```bash
pip install faster-whisper
# Recommended: distil-large-v3 (fast) or large-v3-turbo (best quality)
whisper-server --model distil-large-v3 --port 8080
# Point a custom transcribe handler at http://localhost:8080
```

Iris uses **Web Speech API** in Demo + Local OSS when faster-whisper is not wired.

### TTS — Piper (documented, local server)

```bash
# https://github.com/rhasspy/piper
echo "Hello from Iris" | piper --model en_US-lessac-medium --output_file out.wav
```

Iris uses **browser SpeechSynthesis** by default (already implemented in studio).

### Image gen — FLUX.1-schnell or SDXL (documented, local GPU)

Do **not** use outdated SD 1.5. Recommended local pipelines:

```bash
pip install diffusers torch accelerate transformers

# FLUX.1-schnell (Black Forest Labs, 2024) — fast, high quality
python -c "
from diffusers import FluxPipeline
import torch
pipe = FluxPipeline.from_pretrained('black-forest-labs/FLUX.1-schnell', torch_dtype=torch.bfloat16)
pipe.to('cuda')
img = pipe('minimalist indigo poster', num_inference_steps=4, guidance_scale=0.0).images[0]
img.save('out.png')
"

# SDXL (Stability AI, 2023) — widely supported fallback
# stabilityai/stable-diffusion-xl-base-1.0
```

Expose an HTTP endpoint and set `IRIS_LOCAL_IMAGE_API` in a fork to wire generate_image.

## Cloud path (optional)

| Capability | Provider |
|------------|----------|
| LLM | OpenAI GPT-4o |
| ASR | OpenAI Whisper |
| TTS | OpenAI TTS |
| Images | DALL-E 3 / Replicate SDXL |

Not required for portfolio hero path.

## Health check

- **Server:** `GET /api/status` → `mode: "local-oss"` when Ollama responds
- **UI badge:** Demo Mode (Vercel) · Local OSS (Ollama detected) · hidden in cloud mode
- **Client hint:** If Ollama runs locally but you're on Vercel demo, badge suggests `npm run dev`

## Citations

- Dubey et al. (2024). *The Llama 3 Herd of Models.* arXiv:2407.21783
- Liu et al. (2023). *Visual Instruction Tuning (LLaVA).* NeurIPS
- Radford et al. (2023). *Robust Speech Recognition via Large-Scale Weak Supervision (Whisper).* ICML
- Black Forest Labs (2024). *FLUX.1* — flux.dev
