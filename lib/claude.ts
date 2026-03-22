import Anthropic from "@anthropic-ai/sdk";

// Singleton Anthropic client — uses ANTHROPIC_API_KEY from env
const globalForAnthropic = globalThis as unknown as { anthropic: Anthropic };

export const anthropic =
  globalForAnthropic.anthropic ||
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

if (process.env.NODE_ENV !== "production")
  globalForAnthropic.anthropic = anthropic;

// Model constants — haiku for fast interactions, sonnet for complex tasks
export const FAST_MODEL = "claude-haiku-4-5-20251001";
export const SMART_MODEL = "claude-sonnet-4-20250514";
