import { components } from './_generated/api';
import { v } from 'convex/values';
import {
  internalQuery,
  mutation,
  query,
  type ActionCtx,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server';
import { paginationOptsValidator } from 'convex/server';
import {
  createThread,
  getThreadMetadata,
  saveMessage,
  vMessage,
} from '@convex-dev/agent';
import { getAuthUserId } from './utils';
import type { Id } from './_generated/dataModel';

export const listThreads = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }
    // Use the Convex user ID to list threads
    const threads = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      { userId, paginationOpts: args.paginationOpts }
    );
    return threads;
  },
});

export const createNewThread = mutation({
  args: { title: v.optional(v.string()), initialMessage: v.optional(vMessage) },
  handler: async (ctx, { title, initialMessage }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }
    // Use the Convex user ID to create the thread
    const threadId = await createThread(ctx, components.agent, {
      userId,
      title,
    });
    if (initialMessage) {
      await saveMessage(ctx, components.agent, {
        threadId,
        message: initialMessage,
      });
    }
    return threadId;
  },
});

export const getThreadDetails = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    await authorizeThreadAccess(ctx, threadId);
    const { title, summary } = await getThreadMetadata(ctx, components.agent, {
      threadId,
    });
    return { title, summary };
  },
});

export async function authorizeThreadAccess(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  threadId: string,
  requireUser?: boolean
) {
  const userId = await getAuthUserId(ctx);
  if (requireUser && !userId) {
    throw new Error('Unauthorized: user is required');
  }
  const { userId: threadUserId } = await getThreadMetadata(
    ctx,
    components.agent,
    { threadId }
  );

  if (requireUser && threadUserId) {
    // Thread's userId is now a Convex ID, so we can compare directly
    const isOwner = threadUserId === userId;

    if (!isOwner) {
      throw new Error('Unauthorized: user does not have access to this thread');
    }
  }
}

/**
 * Delete a thread. Users can only delete their own threads.
 */
export const deleteThread = mutation({
  args: { threadId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify the user owns this thread
    await authorizeThreadAccess(ctx, args.threadId, true);

    // Delete all data associated with the thread using async deletion
    let isDone = false;
    while (!isDone) {
      const result = await ctx.runMutation(
        components.agent.threads.deleteAllForThreadIdAsync,
        { threadId: args.threadId }
      );
      isDone = result.isDone;
    }

    return null;
  },
});

/**
 * Internal query to get userId (Convex ID) from threadId (for use in agent tools).
 * Thread metadata now stores the Convex user ID directly.
 */
export const getUserIdFromThread = internalQuery({
  args: { threadId: v.string() },
  returns: v.union(v.id('users'), v.null()),
  handler: async (ctx, args) => {
    const threadMetadata = await getThreadMetadata(ctx, components.agent, {
      threadId: args.threadId,
    });
    const userId = threadMetadata.userId;
    if (!userId) {
      return null;
    }

    // Thread's userId is now a Convex ID, return it directly
    return userId as Id<'users'>;
  },
});
