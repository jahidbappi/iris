export type MessageRole = "user" | "assistant" | "system" | "tool";

export type SessionEventType =
  | "transcription"
  | "thinking"
  | "tool_call"
  | "image_generated"
  | "image_edited"
  | "response"
  | "tts"
  | "error";

export interface SessionEvent {
  id: string;
  type: SessionEventType;
  content: string;
  imageUrl?: string;
  timestamp: number;
  latencyMs?: number;
  costUsd?: number;
}

export interface SessionMetrics {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  gpuSeconds: number;
  totalCostUsd: number;
  requestCount: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  latencies: number[];
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  imageUrl?: string;
}

export interface ToolCallResult {
  tool: "generate_image" | "edit_image" | "describe_scene";
  input: Record<string, unknown>;
  output: string;
  imageUrl?: string;
  latencyMs: number;
  costUsd: number;
}

export interface OrchestratorInput {
  messages: ChatMessage[];
  visionFrame?: string;
  sessionId: string;
}

export interface OrchestratorOutput {
  response: string;
  toolResults: ToolCallResult[];
  imageUrl?: string;
  metrics: {
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    costUsd: number;
  };
}

export interface SessionSnapshot {
  id: string;
  title: string;
  events: SessionEvent[];
  metrics: SessionMetrics;
  createdAt: number;
  shareUrl?: string;
}
