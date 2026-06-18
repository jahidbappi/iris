import OpenAI from "openai";
import Replicate from "replicate";
import { checkOllamaAvailable } from "@/lib/ai/ollama";

export function hasOpenAI(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function hasReplicate(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function getReplicate(): Replicate | null {
  if (!process.env.REPLICATE_API_TOKEN) return null;
  return new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
}

/** True when no cloud or local LLM backend is configured (sync heuristic). */
export function isDemoMode(): boolean {
  return !hasOpenAI();
}

export async function hasLocalOllama(): Promise<boolean> {
  if (hasOpenAI()) return false;
  return checkOllamaAvailable();
}
