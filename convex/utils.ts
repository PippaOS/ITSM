import {
  type QueryCtx,
  type MutationCtx,
  type ActionCtx,
} from './_generated/server';
import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';

/**
 * Get the current user's ID from the users table.
 * For mutations/actions, ensures the user exists in the database first.
 * Returns null if not authenticated or user not found.
 */
export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx | ActionCtx
): Promise<Id<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }

  // Check if we're in a mutation/action context (can run mutations)
  const canRunMutations = 'runMutation' in ctx;

  // Get user from users table
  let user = await ctx.runQuery(api.users.current, {});

  // If user doesn't exist and we can run mutations, create them
  if (!user && canRunMutations) {
    await (ctx as MutationCtx | ActionCtx).runMutation(api.users.store, {});
    user = await ctx.runQuery(api.users.current, {});
  }

  if (!user) {
    return null;
  }

  // Return the user's Convex ID
  return user._id;
}
