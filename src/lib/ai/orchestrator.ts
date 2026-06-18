import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import type { ChatMessage, OrchestratorInput, OrchestratorOutput, ToolCallResult } from "@/types";
import { IRIS_TOOLS, type IrisToolName } from "@/lib/ai/tools";
import { mockOrchestrate } from "@/lib/ai/mock";
import { ollamaOrchestrate } from "@/lib/ai/ollama";
import { getOpenAI, getReplicate, hasOpenAI, hasLocalOllama } from "@/lib/ai/providers";
import { estimateImageCost, estimateTokenCost } from "@/lib/observability/metrics";

async function runImageGeneration(prompt: string, style?: string): Promise<{ url: string; latencyMs: number }> {
  const start = Date.now();
  const replicate = getReplicate();

  if (replicate) {
    const output = (await replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89fbf47f278179e0b6a8e556d8d6f292f8e0d0a8", {
      input: {
        prompt: style ? `${prompt}, ${style} style` : prompt,
        width: 1024,
        height: 1024,
      },
    })) as string[];

    return { url: String(output[0]), latencyMs: Date.now() - start };
  }

  const openai = getOpenAI();
  if (openai) {
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: style ? `${prompt} (${style} style)` : prompt,
      size: "1024x1024",
      n: 1,
    });
    const url = result.data?.[0]?.url;
    if (!url) throw new Error("Image generation returned no URL");
    return { url, latencyMs: Date.now() - start };
  }

  throw new Error("No image provider configured");
}

function toOpenAIMessages(messages: ChatMessage[], visionFrame?: string): ChatCompletionMessageParam[] {
  const mapped: ChatCompletionMessageParam[] = messages.map((m) => ({
    role: m.role === "tool" ? "assistant" : m.role,
    content: m.content,
  }));

  if (visionFrame && mapped.length > 0) {
    const last = mapped[mapped.length - 1];
    if (last.role === "user") {
      mapped[mapped.length - 1] = {
        role: "user",
        content: [
          { type: "text", text: typeof last.content === "string" ? last.content : "Analyze this frame." },
          { type: "image_url", image_url: { url: visionFrame } },
        ],
      };
    }
  }

  return mapped;
}

async function executeTool(
  name: IrisToolName,
  args: Record<string, unknown>,
  visionFrame?: string
): Promise<ToolCallResult> {
  const start = Date.now();

  if (name === "generate_image" || name === "edit_image") {
    const prompt = String(args.prompt ?? "creative visual");
    const style = args.style ? String(args.style) : undefined;
    const basePrompt =
      name === "edit_image" && visionFrame
        ? `Edit the reference scene: ${prompt}`
        : prompt;

    try {
      const { url, latencyMs } = await runImageGeneration(basePrompt, style);
      return {
        tool: name,
        input: args,
        output: "Image generated successfully.",
        imageUrl: url,
        latencyMs,
        costUsd: estimateImageCost(),
      };
    } catch {
      return {
        tool: name,
        input: args,
        output: "Image generation unavailable; using fallback.",
        imageUrl: visionFrame,
        latencyMs: Date.now() - start,
        costUsd: 0,
      };
    }
  }

  return {
    tool: "describe_scene",
    input: args,
    output: visionFrame
      ? "Vision frame received. Scene contains visual elements ready for creative direction."
      : "No vision frame available.",
    latencyMs: Date.now() - start,
    costUsd: 0.001,
  };
}

export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorOutput> {
  if (hasOpenAI()) {
    return orchestrateCloud(input);
  }

  if (await hasLocalOllama()) {
    return ollamaOrchestrate(input);
  }

  return mockOrchestrate(input);
}

async function orchestrateCloud(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const openai = getOpenAI();
  if (!openai) {
    return mockOrchestrate(input);
  }

  const start = Date.now();
  const messages = toOpenAIMessages(input.messages, input.visionFrame);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are Iris, an elite creative director AI. You see through the user's camera, speak naturally, and use tools to generate or edit visuals. Be concise, tasteful, and action-oriented.",
      },
      ...messages,
    ],
    tools: IRIS_TOOLS as ChatCompletionTool[],
    tool_choice: "auto",
  });

  const choice = completion.choices[0];
  const toolResults: ToolCallResult[] = [];
  let imageUrl: string | undefined;
  let response = choice.message.content ?? "";

  if (choice.message.tool_calls?.length) {
    for (const call of choice.message.tool_calls) {
      if (call.type !== "function") continue;
      const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
      const result = await executeTool(call.function.name as IrisToolName, args, input.visionFrame);
      toolResults.push(result);
      if (result.imageUrl) imageUrl = result.imageUrl;
    }

    if (!response) {
      response = toolResults.map((t) => t.output).join(" ");
    }
  }

  const inputTokens = completion.usage?.prompt_tokens ?? 0;
  const outputTokens = completion.usage?.completion_tokens ?? 0;

  return {
    response,
    toolResults,
    imageUrl,
    metrics: {
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - start,
      costUsd:
        estimateTokenCost(inputTokens, outputTokens) +
        toolResults.reduce((sum, t) => sum + t.costUsd, 0),
    },
  };
}
