/// <reference types="node" />
import { type Config } from '@convex-dev/agent';
import { openrouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { internal } from '../_generated/api';
import type { FunctionReference, GenericActionCtx } from 'convex/server';

/**
 * Get the language model configuration.
 * This function should be called from actions to get a specific model.
 *
 * @param modelId The specific model ID to use
 * @throws Error if OPENROUTER_API_KEY is not set
 * @throws Error if modelId is not provided
 */
export async function getLanguageModel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: GenericActionCtx<any>,
  modelId: string
): Promise<LanguageModelV2> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      'OPENROUTER_API_KEY not set. Run `npx convex env set OPENROUTER_API_KEY=<your-key>`'
    );
  }

  if (!modelId) {
    throw new Error('Model ID is required');
  }

  // Get the ZDR setting
  const zdrValue: string | null = await ctx.runQuery(
    internal.appConfig.getConfigInternal as FunctionReference<
      'query',
      'internal',
      { key: string },
      string | null
    >,
    { key: 'openrouter_zdr' }
  );

  // Create model with ZDR setting if enabled
  // Note: OpenRouter expects { provider: { zdr: true } } but the TypeScript types don't include it yet
  // Using type assertion to bypass the type check
  const modelOptions =
    zdrValue === 'true'
      ? ({
          provider: {
            zdr: true,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
      : undefined;

  return openrouter.chat(modelId, modelOptions) as LanguageModelV2;
}

/**
 * Get the base agent configuration (without language model).
 * The language model should be added separately using getLanguageModel().
 */
export const baseConfig = {
  callSettings: {
    temperature: 0.2,
  },
} satisfies Partial<Config>;
