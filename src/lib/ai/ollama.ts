import type { ChatMessage, OrchestratorInput, OrchestratorOutput, ToolCallResult } from "@/types";
import type { IrisToolName } from "@/lib/ai/tools";
import { IRIS_TOOLS } from "@/lib/ai/tools";
import { pickMockImage } from "@/lib/ai/mock-images";
import { estimateTokenCost } from "@/lib/observability/metrics";

const DEFAULT_BASE = "http://127.0.0.1:11434";
/** Meta Llama 3.1 8B — strong quality/speed for local tool-calling (Dubey et al., 2024). */
const DEFAULT_MODEL = "llama3.1:8b";
const DEFAULT_VISION_MODEL = "llava";

type OllamaMessage = {
  role: string;
  content: string;
  tool_calls?: Array<{
    function: { name: string; arguments: Record<string, unknown> };
  }>;
};

type OllamaChatResponse = {
  message: OllamaMessage;
  eval_count?: number;
  prompt_eval_count?: number;
};

export function getOllamaBaseUrl(): string {
  return process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE;
}

export function getOllamaVisionModel(): string {
  return process.env.OLLAMA_VISION_MODEL ?? DEFAULT_VISION_MODEL;
}

export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
}

export async function checkOllamaAvailable(): Promise<boolean> {
  if (process.env.OLLAMA_DISABLED === "true") return false;
  try {
    const res = await fetch(`${getOllamaBaseUrl()}/api/tags`, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${getOllamaBaseUrl()}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    return (data.models ?? []).map((m) => m.name);
  } catch {
    return [];
  }
}

function toOllamaTools() {
  return IRIS_TOOLS.map((t) => ({
    type: "function" as const,
    function: t.function,
  }));
}

function inferToolFromText(text: string, visionFrame?: string): IrisToolName | null {
  if (/generate|create|draw|design|make|poster|logo|visual|image|picture/i.test(text)) {
    return /edit|transform|change|modify/i.test(text) ? "edit_image" : "generate_image";
  }
  if (visionFrame && /see|look|describe|what|frame|scene/i.test(text)) {
    return "describe_scene";
  }
  return null;
}

async function describeSceneWithVision(
  visionFrame: string,
  focus?: string
): Promise<string> {
  const model = getOllamaVisionModel();
  const base64 = visionFrame.includes(",") ? visionFrame.split(",")[1] : visionFrame;
  const prompt = focus
    ? `Describe this scene with focus on ${focus}. Be concise and creative-director tone.`
    : "Describe what you see in this frame. Be concise — lighting, composition, subjects.";

  try {
    const res = await fetch(`${getOllamaBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt, images: [base64] }],
        stream: false,
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) {
      return "Vision model unavailable. Pull LLaVA: ollama pull llava";
    }
    const data = (await res.json()) as OllamaChatResponse;
    return data.message.content ?? "Scene analyzed via LLaVA.";
  } catch {
    return "Vision analysis failed. Ensure ollama pull llava and a GPU with enough VRAM.";
  }
}

async function executeLocalTool(
  name: IrisToolName,
  args: Record<string, unknown>,
  visionFrame: string | undefined,
  seed: string
): Promise<ToolCallResult> {
  const start = Date.now();

  if (name === "generate_image" || name === "edit_image") {
    const prompt = String(args.prompt ?? "creative visual");
    return {
      tool: name,
      input: args,
      output:
        "Local OSS mode: image generation uses placeholders. For FLUX.1-schnell or SDXL locally, see OSS.md (diffusers).",
      imageUrl: pickMockImage(`${seed}:${prompt}`),
      latencyMs: Date.now() - start,
      costUsd: 0,
    };
  }

  if (name === "describe_scene" && visionFrame) {
    const focus = args.focus ? String(args.focus) : undefined;
    const description = await describeSceneWithVision(visionFrame, focus);
    return {
      tool: "describe_scene",
      input: args,
      output: description,
      latencyMs: Date.now() - start,
      costUsd: 0,
    };
  }

  return {
    tool: "describe_scene",
    input: args,
    output: visionFrame
      ? "Vision frame received. Ask me to describe what I see."
      : "No vision frame attached.",
    latencyMs: Date.now() - start,
    costUsd: 0,
  };
}

export async function ollamaOrchestrate(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const start = Date.now();
  const model = getOllamaModel();
  const lastMessage = input.messages[input.messages.length - 1]?.content ?? "";

  const messages = [
    {
      role: "system",
      content:
        "You are Iris, a creative director AI. Use tools when the user wants images created, edited, or scenes described. Be concise and action-oriented.",
    },
    ...input.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let response: OllamaChatResponse;
  try {
    const res = await fetch(`${getOllamaBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        tools: toOllamaTools(),
        stream: false,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      throw new Error(`Ollama chat failed: ${res.status}`);
    }
    response = (await res.json()) as OllamaChatResponse;
  } catch {
    return fallbackOllamaOrchestrate(input, start);
  }

  const toolResults: ToolCallResult[] = [];
  let imageUrl: string | undefined;
  let text = response.message.content ?? "";

  const toolCalls = response.message.tool_calls ?? [];
  if (toolCalls.length > 0) {
    for (const call of toolCalls) {
      const result = await executeLocalTool(
        call.function.name as IrisToolName,
        call.function.arguments ?? {},
        input.visionFrame,
        lastMessage
      );
      toolResults.push(result);
      if (result.imageUrl) imageUrl = result.imageUrl;
    }
    if (!text) text = toolResults.map((t) => t.output).join(" ");
  } else {
    const inferred = inferToolFromText(lastMessage, input.visionFrame);
    if (inferred) {
      const result = await executeLocalTool(
        inferred,
        { prompt: lastMessage },
        input.visionFrame,
        lastMessage
      );
      toolResults.push(result);
      if (result.imageUrl) imageUrl = result.imageUrl;
    }
    if (!text) {
      text =
        toolResults[0]?.output ??
        "I'm Iris running on local Ollama. Ask me to generate visuals or describe your camera frame.";
    }
  }

  const inputTokens = response.prompt_eval_count ?? 120 + lastMessage.length / 4;
  const outputTokens = response.eval_count ?? 80 + text.length / 4;

  return {
    response: text,
    toolResults,
    imageUrl,
    metrics: {
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - start,
      costUsd: estimateTokenCost(inputTokens, outputTokens),
    },
  };
}

async function fallbackOllamaOrchestrate(
  input: OrchestratorInput,
  start: number
): Promise<OrchestratorOutput> {
  const lastMessage = input.messages[input.messages.length - 1]?.content ?? "";
  const toolResults: ToolCallResult[] = [];
  let imageUrl: string | undefined;

  const inferred = inferToolFromText(lastMessage, input.visionFrame);
  if (inferred) {
    const result = await executeLocalTool(
      inferred,
      { prompt: lastMessage },
      input.visionFrame,
      lastMessage
    );
    toolResults.push(result);
    if (result.imageUrl) imageUrl = result.imageUrl;
  }

  const response =
    toolResults[0]?.output ??
    "Ollama is reachable but the chat request failed. Check: ollama pull llama3.1:8b";

  return {
    response,
    toolResults,
    imageUrl,
    metrics: {
      inputTokens: 100,
      outputTokens: 60,
      latencyMs: Date.now() - start,
      costUsd: 0,
    },
  };
}
