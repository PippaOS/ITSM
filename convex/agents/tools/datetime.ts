import { createTool } from '@convex-dev/agent';
import { z } from 'zod';

/**
 * Tool to get the current date and time.
 * Returns an ISO 8601 timestamp string in UTC.
 * This matches the format of _creationTime fields on entities.
 */
export const getCurrentDateTime = createTool({
  description:
    'Get the current date and time as an ISO 8601 timestamp string (UTC). Use this when users ask about how recent something is, or when you need to calculate how long ago something happened. Compare this with entity _creationTime values to determine time elapsed.',
  args: z.object({}),
  handler: async (): Promise<string> => {
    return new Date().toISOString();
  },
});
