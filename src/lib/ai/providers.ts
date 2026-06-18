import OpenAI from "openai";
import Replicate from "replicate";

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

export function isDemoMode(): boolean {
  return !hasOpenAI();
}
