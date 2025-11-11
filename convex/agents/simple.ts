import { components } from '../_generated/api';
import { Agent } from '@convex-dev/agent';
import { defaultConfig } from './config';
import { getAllTools } from './tools';

const agentComponent = components.agent;
export const agent = new Agent(agentComponent, {
  name: 'Chat Assistant',
  instructions: `You are a helpful assistant. Be friendly, concise, and helpful in your responses.
When you use tools, always provide a helpful response based on the tool results.
Always format your output in markdown.
When presenting entity data or lists, always use tables.
If presenting a single entity, do not include a header in the table.

IMPORTANT: When users ask about recent updates, changes, or when something happened (e.g., "recent tickets", "latest changes", "how long ago"), you MUST first use the getCurrentDateTime tool to get the current time. Both the current time and entity _creationTime fields are ISO 8601 timestamp strings in UTC, making them easy to compare and calculate time differences. Present time differences in a human-readable format (e.g., "2 hours ago", "3 days ago", "last week").`,
  ...defaultConfig,
  tools: getAllTools(),
  maxSteps: 20,
});
