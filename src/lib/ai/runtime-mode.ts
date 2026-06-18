import { checkOllamaAvailable, getOllamaModel, getOllamaVisionModel, listOllamaModels } from "@/lib/ai/ollama";
import { hasOpenAI, hasReplicate } from "@/lib/ai/providers";

export type RuntimeMode = "demo" | "local-oss" | "cloud";

export type RuntimeStatus = {
  mode: RuntimeMode;
  demoMode: boolean;
  hasOpenAI: boolean;
  hasReplicate: boolean;
  hasOllama: boolean;
  ollamaModel: string | null;
  ollamaVisionModel: string | null;
  ollamaModels: string[];
  freeStack: {
    llm: string;
    asr: string;
    tts: string;
    imageGen: string;
  };
};

export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  const hasOllama = await checkOllamaAvailable();
  const mode: RuntimeMode = hasOpenAI() ? "cloud" : hasOllama ? "local-oss" : "demo";
  const ollamaModels = hasOllama ? await listOllamaModels() : [];

  const freeStack =
    mode === "cloud"
      ? {
          llm: "OpenAI GPT-4o",
          asr: "OpenAI Whisper",
          tts: "OpenAI TTS",
          imageGen: hasReplicate() ? "Replicate SDXL" : "DALL-E 3",
        }
      : mode === "local-oss"
        ? {
            llm: `Ollama (${getOllamaModel()})`,
            asr: "Web Speech API · faster-whisper optional",
            tts: "Browser SpeechSynthesis · Piper optional",
            imageGen: "Placeholder · FLUX.1-schnell / SDXL local (OSS.md)",
          }
        : {
            llm: "Scripted mock",
            asr: "Web Speech API or mock transcript",
            tts: "Browser SpeechSynthesis",
            imageGen: "Unsplash placeholders",
          };

  return {
    mode,
    demoMode: mode === "demo",
    hasOpenAI: hasOpenAI(),
    hasReplicate: hasReplicate(),
    hasOllama,
    ollamaModel: hasOllama ? getOllamaModel() : null,
    ollamaVisionModel: hasOllama ? getOllamaVisionModel() : null,
    ollamaModels,
    freeStack,
  };
}
