import { components, internal } from './_generated/api';
import { action, internalAction, mutation, query } from './_generated/server';
import {
  getThreadMetadata,
  listMessages,
  listUIMessages,
  saveMessage,
  syncStreams,
  vStreamArgs,
} from '@convex-dev/agent';
import { v } from 'convex/values';
import { getAgentWithDynamicModel } from './agents/simple';
import { authorizeThreadAccess } from './threads';
import { paginationOptsValidator } from 'convex/server';
import { getAllTools } from './agents/tools';

type ToolMap = ReturnType<typeof getAllTools>;
type GenericTool = ToolMap extends Record<string, infer T> ? T : never;

/**
 * Extract the first few words from a message to use as a thread title.
 */
function extractTitleFromMessage(
  message: string,
  maxWords: number = 6
): string {
  const words = message.trim().split(/\s+/);
  const title = words.slice(0, maxWords).join(' ');
  // Truncate to 50 characters if needed
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
}

/**
 * Save a user message and kick off an async response.
 * This enables optimistic updates on the client.
 */
export const sendMessage = mutation({
  args: { prompt: v.string(), threadId: v.string(), modelId: v.string() },
  handler: async (ctx, { prompt, threadId, modelId }) => {
    await authorizeThreadAccess(ctx, threadId);

    // Check if we should set the thread title from the first message
    const threadMetadata = await getThreadMetadata(ctx, components.agent, {
      threadId,
    });

    // If thread has no title or empty title, and this might be the first message
    if (!threadMetadata.title || threadMetadata.title.trim() === '') {
      // Check if this is the first user message by listing existing messages
      const existingMessages = await listMessages(ctx, components.agent, {
        threadId,
        paginationOpts: { numItems: 10, cursor: null },
      });

      // Only set title if this is the first user message (no user messages yet)
      // User messages have a userId property, agent messages don't
      const hasUserMessages = existingMessages.page.some(
        msg => msg.userId !== undefined && msg.userId !== null
      );

      if (!hasUserMessages) {
        // Extract title from the first few words of the prompt
        const title = extractTitleFromMessage(prompt);
        await ctx.runMutation(components.agent.threads.updateThread, {
          threadId,
          patch: { title },
        });
      }
    }

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });
    await ctx.scheduler.runAfter(0, internal.chat.generateResponse, {
      threadId,
      promptMessageId: messageId,
      modelId,
    });
  },
});

/**
 * Generate a response to a user message.
 * Any clients listing the messages will automatically get the new message.
 */
export const generateResponse = internalAction({
  args: {
    promptMessageId: v.string(),
    threadId: v.string(),
    modelId: v.string(),
  },
  handler: async (ctx, { promptMessageId, threadId, modelId }) => {
    // Get userId from thread metadata before generating response
    const userId = await ctx.runQuery(internal.threads.getUserIdFromThread, {
      threadId,
    });

    if (!userId) {
      throw new Error('Could not resolve user from thread');
    }

    // All users have access to all tools
    const tools = getAllTools() as Record<string, GenericTool>;

    // Get agent with the specified model
    const dynamicAgent = await getAgentWithDynamicModel(ctx, modelId);

    // Use streamText instead of generateText to enable real-time streaming
    // saveStreamDeltas automatically handles stream consumption and saves deltas
    await dynamicAgent.streamText(
      ctx,
      { threadId },
      {
        promptMessageId,
        tools,
      },
      {
        // Enable saving stream deltas so they can be synced to clients
        saveStreamDeltas: true,
      }
    );
  },
});

/**
 * Query & subscribe to messages & threads
 * Supports streaming when streamArgs is provided
 */
export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(vStreamArgs),
  },
  handler: async (ctx, args) => {
    const { threadId, paginationOpts, streamArgs } = args;
    await authorizeThreadAccess(ctx, threadId);
    const messages = await listUIMessages(ctx, components.agent, {
      threadId,
      paginationOpts,
    });

    // Fetch streaming messages if streamArgs is provided
    const streams = streamArgs
      ? await syncStreams(ctx, components.agent, {
          threadId,
          streamArgs,
        })
      : undefined;

    return { ...messages, streams };
  },
});

/**
 * Get the last model used in a thread (from the most recent assistant message).
 */
export const getLastUsedModel = query({
  args: { threadId: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { threadId }) => {
    await authorizeThreadAccess(ctx, threadId);

    // Get messages directly from the agent component to access the model field
    // Use descending order to get most recent messages first
    const result = await ctx.runQuery(
      components.agent.messages.listMessagesByThreadId,
      { threadId, order: 'desc' as const }
    );

    // Find the last assistant message that has a model
    // Messages are in descending order (newest first), so we can iterate from start
    for (const msg of result.page) {
      // Check if it's an assistant message by checking the role field
      // Assistant messages have role: "assistant"
      if (msg.message?.role === 'assistant' && msg.model) {
        return msg.model;
      }
    }

    return null;
  },
});

/**
 * Public action to run a specific tool within a thread context.
 */
export const runToolForThread = action({
  args: {
    threadId: v.string(),
    toolName: v.string(),
    toolArgs: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, { threadId, toolName, toolArgs }) => {
    // Ensure caller has access to the thread
    await authorizeThreadAccess(ctx, threadId, true);

    // Resolve the thread's user (needed for role-based access)
    const userId = await ctx.runQuery(internal.threads.getUserIdFromThread, {
      threadId,
    });
    if (!userId) {
      throw new Error('Could not resolve user from thread');
    }

    // All users have access to all tools
    const tools = getAllTools() as Record<string, GenericTool>;

    const selected = tools[toolName];
    if (!selected) {
      throw new Error(`Tool ${toolName} is not available for this thread`);
    }

    // Get agent with first available model from database config
    // In tool invocations, we don't have a specific model selected, so use the first one
    const modelsConfig = await ctx.runQuery(
      internal.appConfig.getConfigInternal,
      {
        key: 'openrouter_models',
      }
    );

    let modelToUse: string | null = null;
    if (modelsConfig) {
      try {
        const parsedModels = JSON.parse(modelsConfig);
        if (Array.isArray(parsedModels) && parsedModels.length > 0) {
          modelToUse = parsedModels[0];
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (!modelToUse) {
      throw new Error('No models configured');
    }

    const dynamicAgent = await getAgentWithDynamicModel(ctx, modelToUse);

    // Inject threadId and agent metadata into the tool context
    const toolContext = {
      ...(ctx as unknown as Record<string, unknown>),
      threadId,
      userId,
      agent: dynamicAgent,
    };
    const toolInstance = {
      ...selected,
      ctx: toolContext,
    } as GenericTool & { ctx: typeof toolContext };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (toolInstance as any).execute(
      (toolArgs as Record<string, unknown>) ?? {}
    );
    return result as unknown;
  },
});
