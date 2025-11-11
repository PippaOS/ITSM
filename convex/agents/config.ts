/// <reference types="node" />
import { type Config } from '@convex-dev/agent';
import { openrouter } from '@openrouter/ai-sdk-provider';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { internal } from '../_generated/api';
import type { FunctionReference, GenericActionCtx } from 'convex/server';

/**
 * Get the language model configuration from the database.
 * This function should be called from actions to get the current model.
 *
 * @throws Error if OPENROUTER_API_KEY is not set
 * @throws Error if no model is configured in the database
 */
export async function getLanguageModel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: GenericActionCtx<any>
): Promise<LanguageModelV2> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      'OPENROUTER_API_KEY not set. Run `npx convex env set OPENROUTER_API_KEY=<your-key>`'
    );
  }

  // Get the model from the database - no fallback
  const configValue: string | null = await ctx.runQuery(
    internal.appConfig.getConfigInternal as FunctionReference<
      'query',
      'internal',
      { key: string },
      string | null
    >,
    { key: 'openrouter_model' }
  );

  if (!configValue) {
    throw new Error(
      'No model configured. Please set the "openrouter_model" in app settings.'
    );
  }

  return openrouter.chat(configValue) as LanguageModelV2;
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
