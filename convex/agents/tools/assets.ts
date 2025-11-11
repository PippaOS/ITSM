import { createTool } from '@convex-dev/agent';
import { internal } from '../../_generated/api';
import { z } from 'zod';
import { resolveUserId } from '../helpers/userIdResolution';
import { serializeMachine } from '../helpers/serialization';

/**
 * Tool to retrieve the current user's assigned assets (machines).
 */
export const getMyAssets = createTool({
  description:
    "Retrieve the user's own assets (machines assigned to them). Returns a list of machines with their specifications including RAM, storage, graphics card, processor, and status.",
  args: z.object({}),
  handler: async (
    ctx
  ): Promise<
    Array<{
      _id: string;
      _creationTime: string;
      make: string;
      model: string;
      type: 'Laptop' | 'Desktop' | 'Server';
      ramGb: number;
      storageCapacityGb: number;
      storageType: 'SSD' | 'HDD';
      graphicsCardName: string;
      processorName: string;
      assignedToUserId?: string;
      assignedToUserEmail?: string;
      status:
        | 'Available'
        | 'Assigned'
        | 'In Use'
        | 'Maintenance'
        | 'Retired'
        | 'Decommissioned'
        | 'Lost';
    }>
  > => {
    const { userId } = await resolveUserId(ctx, {
      toolName: 'getMyAssets',
    });

    // Call the internal query with the userId
    const assets = await ctx.runQuery(internal.machines.listMachinesByUserId, {
      userId,
    });

    // Ensure we return a plain array that can be serialized
    const result = assets.map(asset => serializeMachine(asset));

    // Ensure the result is JSON-serializable
    try {
      JSON.stringify(result);
    } catch (error) {
      throw new Error('Tool result is not JSON-serializable: ' + error);
    }

    return result;
  },
});
