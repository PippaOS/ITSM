import { createTool } from '@convex-dev/agent';
import { internal } from '../../_generated/api';
import { z } from 'zod';
import { resolveUserId } from '../helpers/userIdResolution';
import { serializeUser } from '../helpers/serialization';

/**
 * Tool to search for users by name or email address.
 * Available to all user levels.
 * Returns at most 1 matching user.
 */
export const searchUsers = createTool({
  description:
    'Search for users in the system by name or email address. Returns at most 1 matching user with their Convex ID, name, and email. If multiple users match, only the first one is returned.',
  args: z.object({
    searchTerm: z
      .string()
      .min(1)
      .describe(
        'The search term to match against user names or email addresses (case-insensitive)'
      ),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    _id: string;
    _creationTime: string;
    name: string;
    email?: string;
  } | null> => {
    await resolveUserId(ctx, {
      toolName: 'searchUsers',
    });

    // Call the internal query to search users
    const users = await ctx.runQuery(internal.users.searchUsers, {
      searchTerm: args.searchTerm,
    });

    // Return only the first matching user, or null if no matches
    if (users.length === 0) {
      return null;
    }

    // Serialize the first user (externalId is automatically excluded by serializeUser)
    return serializeUser(users[0]);
  },
});
