import { components } from '../_generated/api';
import { Agent } from '@convex-dev/agent';
import { baseConfig, getLanguageModel } from './config';
import { getAllTools } from './tools';
import type { GenericActionCtx } from 'convex/server';

const agentComponent = components.agent;

const baseAgentConfig = {
  name: 'Chat Assistant',
  instructions: `You are a helpful assistant. Be friendly, concise, and helpful in your responses.
When you use tools, always provide a helpful response based on the tool results.
Always format your output in markdown.
When presenting entity data or lists, always use tables.
If presenting a single entity, do not include a header in the table.

IMPORTANT: When users ask about recent updates, changes, or when something happened (e.g., "recent tickets", "latest changes", "how long ago"), you MUST first use the getCurrentDateTime tool to get the current time. Both the current time and entity _creationTime fields are ISO 8601 timestamp strings in UTC, making them easy to compare and calculate time differences. Present time differences in a human-readable format (e.g., "2 hours ago", "3 days ago", "last week").`,
  ...baseConfig,
  tools: getAllTools(),
  maxSteps: 20,
};

/**
 * Get an agent instance with the model from the database config.
 * This should be called from actions to use the dynamically configured model.
 */
export async function getAgentWithDynamicModel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: GenericActionCtx<any>
): Promise<Agent> {
  const languageModel = await getLanguageModel(ctx);
  return new Agent(agentComponent, {
    ...baseAgentConfig,
    languageModel,
  });
}
