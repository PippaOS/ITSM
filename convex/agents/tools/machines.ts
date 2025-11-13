import { createTool } from '@convex-dev/agent';
import { internal } from '../../_generated/api';
import { z } from 'zod';
import { resolveUserId } from '../helpers/userIdResolution';
import { serializeMachine } from '../helpers/serialization';
import type { Id } from '../../_generated/dataModel';

/**
 * Enum of optional fields that can be selected for machine results.
 * Note: name, make, model, and _id are always included.
 */
const MachineFieldEnum = z.enum([
  '_creationTime',
  'serialNumber',
  'type',
  'ramGb',
  'storageCapacityGb',
  'storageType',
  'graphicsCardName',
  'processorName',
  'assignedToUserId',
  'assignedToUserEmail',
  'status',
]);

type MachineField = z.infer<typeof MachineFieldEnum>;

/**
 * Tool to search for machines in the system.
 * Returns at most 10 results.
 * Always returns: name, make, model, and _id.
 * Other fields can be optionally selected via the fields parameter.
 */
export const searchMachines = createTool({
  description:
    'Search for machines in the system by assignedToUserId and/or name. Returns at most 10 matching machines. Always returns name, make, model, and id. Use the fields parameter to select additional fields you need. The name search is case-insensitive and matches partial names.',
  args: z.object({
    assignedToUserId: z
      .string()
      .optional()
      .describe(
        'Optional: Filter machines by the Convex ID (_id) of the user they are assigned to. Use searchUsers to find user Convex IDs.'
      ),
    name: z
      .string()
      .optional()
      .describe(
        'Optional: Filter machines by name (case-insensitive partial match). For example, "PIPPA" will match "PIPPAOS001".'
      ),
    fields: z
      .array(MachineFieldEnum)
      .optional()
      .describe(
        'Optional array of additional fields to include in the response. Available fields: _creationTime, serialNumber, type, ramGb, storageCapacityGb, storageType, graphicsCardName, processorName, assignedToUserId, assignedToUserEmail, status. Fields name, make, model, and _id are always included.'
      ),
  }),
  handler: async (ctx, args): Promise<Array<Record<string, unknown>>> => {
    // Resolve userId just for logging/context
    await resolveUserId(ctx, {
      toolName: 'searchMachines',
    });

    // Call the internal query to search machines
    const machines = await ctx.runQuery(internal.machines.searchMachines, {
      assignedToUserId: args.assignedToUserId
        ? (args.assignedToUserId as Id<'users'>)
        : undefined,
      name: args.name,
    });

    // Serialize all machines first
    const serializedMachines = machines.map(machine =>
      serializeMachine(machine)
    );

    // Filter fields based on selection
    // Always include: name, make, model, _id
    // Only include other fields if specified in args.fields
    const selectedFields = args.fields
      ? new Set(args.fields)
      : new Set<MachineField>();

    const result = serializedMachines.map(machine => {
      // Always include: name, make, model, _id
      const filtered: Record<string, unknown> = {
        _id: machine._id,
        name: machine.name,
        make: machine.make,
        model: machine.model,
      };

      // Add selected optional fields
      if (selectedFields.has('_creationTime')) {
        filtered._creationTime = machine._creationTime;
      }
      if (selectedFields.has('serialNumber')) {
        filtered.serialNumber = machine.serialNumber;
      }
      if (selectedFields.has('type')) {
        filtered.type = machine.type;
      }
      if (selectedFields.has('ramGb')) {
        filtered.ramGb = machine.ramGb;
      }
      if (selectedFields.has('storageCapacityGb')) {
        filtered.storageCapacityGb = machine.storageCapacityGb;
      }
      if (selectedFields.has('storageType')) {
        filtered.storageType = machine.storageType;
      }
      if (selectedFields.has('graphicsCardName')) {
        filtered.graphicsCardName = machine.graphicsCardName;
      }
      if (selectedFields.has('processorName')) {
        filtered.processorName = machine.processorName;
      }
      if (selectedFields.has('assignedToUserId')) {
        filtered.assignedToUserId = machine.assignedToUserId;
      }
      if (selectedFields.has('assignedToUserEmail')) {
        filtered.assignedToUserEmail = machine.assignedToUserEmail;
      }
      if (selectedFields.has('status')) {
        filtered.status = machine.status;
      }

      return filtered;
    });

    return result;
  },
});
