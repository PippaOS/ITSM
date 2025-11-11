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
import { agent } from './agents/simple';
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
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
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
    });
  },
});

/**
 * Generate a response to a user message.
 * Any clients listing the messages will automatically get the new message.
 */
export const generateResponse = internalAction({
  args: { promptMessageId: v.string(), threadId: v.string() },
  handler: async (ctx, { promptMessageId, threadId }) => {
    // Get userId from thread metadata before generating response
    const userId = await ctx.runQuery(internal.threads.getUserIdFromThread, {
      threadId,
    });

    if (!userId) {
      throw new Error('Could not resolve user from thread');
    }

    // All users have access to all tools
    const tools = getAllTools() as Record<string, GenericTool>;

    // Use streamText instead of generateText to enable real-time streaming
    // saveStreamDeltas automatically handles stream consumption and saves deltas
    await agent.streamText(
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

    // Inject threadId and agent metadata into the tool context
    const toolContext = {
      ...(ctx as unknown as Record<string, unknown>),
      threadId,
      userId,
      agent,
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
