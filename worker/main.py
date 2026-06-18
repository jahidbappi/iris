"""Modal-ready GPU worker for Iris image generation jobs."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Iris Worker", version="0.1.0")


class ImageJob(BaseModel):
    prompt: str
    style: str | None = None
    width: int = 1024
    height: int = 1024


class ImageJobResult(BaseModel):
    status: str
    prompt: str
    image_url: str | None = None
    latency_ms: int


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "iris-worker"}


@app.post("/generate", response_model=ImageJobResult)
def generate(job: ImageJob) -> ImageJobResult:
    # Placeholder for Modal GPU deployment with SDXL / Flux
    return ImageJobResult(
        status="queued",
        prompt=job.prompt,
        image_url=None,
        latency_ms=0,
    )
