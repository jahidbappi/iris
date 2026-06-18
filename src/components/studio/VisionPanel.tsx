"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, MonitorUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/store/session-store";

type VisionMode = "camera" | "screen" | "upload";

export function VisionPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<VisionMode>("camera");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const setVisionFrame = useSessionStore((s) => s.setVisionFrame);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  async function captureFrame(): Promise<string | null> {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function startCamera() {
    stopStream();
    const media = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 1280, height: 720 },
      audio: false,
    });
    setStream(media);
    setMode("camera");
    if (videoRef.current) {
      videoRef.current.srcObject = media;
      await videoRef.current.play();
    }
  }

  async function startScreenShare() {
    stopStream();
    const media = await navigator.mediaDevices.getDisplayMedia({ video: true });
    setStream(media);
    setMode("screen");
    if (videoRef.current) {
      videoRef.current.srcObject = media;
      await videoRef.current.play();
    }
  }

  function stopStream() {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }

  async function handleUpload(file: File) {
    stopStream();
    setMode("upload");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setVisionFrame(dataUrl);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (mode !== "upload") {
        const frame = await captureFrame();
        if (frame) setVisionFrame(frame);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [mode, setVisionFrame, stream]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={mode === "camera" ? "default" : "secondary"} onClick={startCamera}>
          <Camera className="h-4 w-4" /> Camera
        </Button>
        <Button size="sm" variant={mode === "screen" ? "default" : "secondary"} onClick={startScreenShare}>
          <MonitorUp className="h-4 w-4" /> Screen
        </Button>
        <Button size="sm" variant={mode === "upload" ? "default" : "secondary"} onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 aspect-video">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {!stream && mode !== "upload" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/40">
            Enable camera or screen to give Iris vision
          </div>
        )}
      </div>
    </div>
  );
}
