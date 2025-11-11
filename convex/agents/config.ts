/// <reference types="node" />
import { type Config } from '@convex-dev/agent';
import { openrouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModelV2 } from '@ai-sdk/provider';

let languageModel: LanguageModelV2;

if (process.env.OPENROUTER_API_KEY) {
  languageModel = openrouter.chat(
    'google/gemini-2.5-flash-preview-09-2025'
  ) as LanguageModelV2;
} else {
  throw new Error(
    'OPENROUTER_API_KEY not set. Run `npx convex env set OPENROUTER_API_KEY=<your-key>`'
  );
}

export const defaultConfig = {
  languageModel,
  callSettings: {
    temperature: 0.2,
  },
} satisfies Config;
