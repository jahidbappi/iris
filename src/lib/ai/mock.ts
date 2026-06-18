import type { OrchestratorInput, OrchestratorOutput, ToolCallResult } from "@/types";
import { estimateImageCost, estimateTokenCost } from "@/lib/observability/metrics";

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  "https://images.unsplash.com/photo-1557672172-298d0903790c?w=800&q=80",
];

function pickMockImage(seed: string): string {
  const index = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return MOCK_IMAGES[index % MOCK_IMAGES.length];
}

export async function mockOrchestrate(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const start = Date.now();
  const lastMessage = input.messages[input.messages.length - 1]?.content ?? "";
  const wantsImage =
    /generate|create|draw|design|make|image|picture|visual|edit|transform/i.test(lastMessage);

  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

  const toolResults: ToolCallResult[] = [];
  let imageUrl: string | undefined;
  let response: string;

  if (wantsImage) {
    imageUrl = pickMockImage(lastMessage);
    toolResults.push({
      tool: /edit|transform|change/i.test(lastMessage) ? "edit_image" : "generate_image",
      input: { prompt: lastMessage, visionFrame: Boolean(input.visionFrame) },
      output: "Image created successfully (demo mode).",
      imageUrl,
      latencyMs: 1200,
      costUsd: estimateImageCost(),
    });
    response =
      "I've crafted a visual based on your request. The composition balances color and form — tell me what you'd like to refine.";
  } else if (input.visionFrame) {
    toolResults.push({
      tool: "describe_scene",
      input: { hasVision: true },
      output: "Scene analyzed: creative workspace with ambient lighting.",
      latencyMs: 400,
      costUsd: 0.001,
    });
    response =
      "I can see your frame. The lighting reads warm and directional — great for product shots. Want me to generate a variation or edit what you're showing?";
  } else {
    response =
      "I'm Iris, your creative director. Share what you see via camera or describe what you'd like to create, and I'll generate or refine it in real time.";
  }

  const inputTokens = 120 + lastMessage.length;
  const outputTokens = 80 + response.length / 4;

  return {
    response,
    toolResults,
    imageUrl,
    metrics: {
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - start,
      costUsd: estimateTokenCost(inputTokens, outputTokens) + toolResults.reduce((s, t) => s + t.costUsd, 0),
    },
  };
}

export function mockTranscription(): string {
  const samples = [
    "Generate a minimalist poster with deep indigo gradients.",
    "Edit this scene to feel more cinematic at golden hour.",
    "What do you see in my frame right now?",
    "Create an abstract logo inspired by sound waves.",
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}
