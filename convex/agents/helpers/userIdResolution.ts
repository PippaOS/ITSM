import { type ActionCtx } from '../../_generated/server';
import { internal } from '../../_generated/api';
import type { Id } from '../../_generated/dataModel';

/**
 * Options for resolving user ID from context.
 */
export interface ResolveUserIdOptions {
  /**
   * Optional tool name for logging purposes.
   */
  toolName?: string;
}

/**
 * Resolves the userId (Convex ID) from threadId.
 * Tools are always called within the context of a chat thread, so threadId
 * should always be available in ctx.threadId when the agent calls the tool.
 *
 * @param ctx - The tool context (includes threadId automatically injected by Agent)
 * @param options - Resolution options
 * @returns Object with userId (Convex ID) and threadId, or throws error if userId cannot be determined
 */
export async function resolveUserId(
  ctx: ActionCtx & { threadId?: string },
  options: ResolveUserIdOptions = {}
): Promise<{ userId: Id<'users'>; threadId: string }> {
  const threadId = ctx.threadId;
  const toolContext = options.toolName ? ` [${options.toolName}]` : '';

  if (!threadId) {
    throw new Error(
      `threadId is required${toolContext}. This tool must be called within a chat thread context.`
    );
  }

  const userId = await ctx.runQuery(internal.threads.getUserIdFromThread, {
    threadId,
  });

  if (!userId) {
    throw new Error(
      `Could not determine userId for threadId: ${threadId}${toolContext}. Thread may not exist or may not have an associated user.`
    );
  }

  return { userId, threadId };
}
