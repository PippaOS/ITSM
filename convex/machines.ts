import {
  mutation,
  internalQuery,
  internalMutation,
  query,
} from './_generated/server';
import { v } from 'convex/values';

/**
 * List all machines.
 */
export const listMachines = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('machines'),
      _creationTime: v.number(),
      name: v.string(),
      make: v.string(),
      model: v.string(),
      serialNumber: v.optional(v.string()),
      type: v.union(
        v.literal('Laptop'),
        v.literal('Desktop'),
        v.literal('Server')
      ),
      ramGb: v.number(),
      storageCapacityGb: v.number(),
      storageType: v.union(v.literal('SSD'), v.literal('HDD')),
      graphicsCardName: v.string(),
      processorName: v.string(),
      assignedToUserId: v.optional(v.id('users')),
      assignedToUserEmail: v.optional(v.string()),
      status: v.union(
        v.literal('Available'),
        v.literal('Assigned'),
        v.literal('In Use'),
        v.literal('Maintenance'),
        v.literal('Retired'),
        v.literal('Decommissioned'),
        v.literal('Lost')
      ),
    })
  ),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const machines = await ctx.db.query('machines').collect();
    const result = [];
    for (const machine of machines) {
      let assignedToUserEmail: string | undefined = undefined;
      if (machine.assignedToUserId) {
        const assignedUser = await ctx.db.get(machine.assignedToUserId);
        assignedToUserEmail = assignedUser?.email;
      }
      result.push({
        ...machine,
        assignedToUserEmail,
      });
    }
    return result;
  },
});

/**
 * List machines assigned to the current user.
 */
export const listMachinesByAssignedUser = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('machines'),
      _creationTime: v.number(),
      name: v.string(),
      make: v.string(),
      model: v.string(),
      serialNumber: v.optional(v.string()),
      type: v.union(
        v.literal('Laptop'),
        v.literal('Desktop'),
        v.literal('Server')
      ),
      ramGb: v.number(),
      storageCapacityGb: v.number(),
      storageType: v.union(v.literal('SSD'), v.literal('HDD')),
      graphicsCardName: v.string(),
      processorName: v.string(),
      assignedToUserId: v.optional(v.id('users')),
      assignedToUserEmail: v.optional(v.string()),
      status: v.union(
        v.literal('Available'),
        v.literal('Assigned'),
        v.literal('In Use'),
        v.literal('Maintenance'),
        v.literal('Retired'),
        v.literal('Decommissioned'),
        v.literal('Lost')
      ),
    })
  ),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    // Look up the current user by externalId
    const user = await ctx.db
      .query('users')
      .withIndex('by_external_id', q => q.eq('externalId', identity.subject))
      .unique();

    if (user === null) {
      // User not found in database, return empty array
      return [];
    }

    const machines = await ctx.db
      .query('machines')
      .withIndex('by_assigned_to_user_id', q =>
        q.eq('assignedToUserId', user._id)
      )
      .collect();
    const result = [];
    for (const machine of machines) {
      let assignedToUserEmail: string | undefined = undefined;
      if (machine.assignedToUserId) {
        const assignedUser = await ctx.db.get(machine.assignedToUserId);
        assignedToUserEmail = assignedUser?.email;
      }
      result.push({
        ...machine,
        assignedToUserEmail,
      });
    }
    return result;
  },
});

/**
 * Internal query to list machines by user ID (for use in agent tools).
 */
export const listMachinesByUserId = internalQuery({
  args: { userId: v.id('users') }, // Convex ID
  returns: v.array(
    v.object({
      _id: v.id('machines'),
      _creationTime: v.number(),
      name: v.string(),
      make: v.string(),
      model: v.string(),
      serialNumber: v.optional(v.string()),
      type: v.union(
        v.literal('Laptop'),
        v.literal('Desktop'),
        v.literal('Server')
      ),
      ramGb: v.number(),
      storageCapacityGb: v.number(),
      storageType: v.union(v.literal('SSD'), v.literal('HDD')),
      graphicsCardName: v.string(),
      processorName: v.string(),
      assignedToUserId: v.optional(v.id('users')),
      assignedToUserEmail: v.optional(v.string()),
      status: v.union(
        v.literal('Available'),
        v.literal('Assigned'),
        v.literal('In Use'),
        v.literal('Maintenance'),
        v.literal('Retired'),
        v.literal('Decommissioned'),
        v.literal('Lost')
      ),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db.get(args.userId);

    if (user === null) {
      // User not found in database, return empty array
      return [];
    }

    const machines = await ctx.db
      .query('machines')
      .withIndex('by_assigned_to_user_id', q =>
        q.eq('assignedToUserId', args.userId)
      )
      .collect();

    const result = [];
    for (const machine of machines) {
      let assignedToUserEmail: string | undefined = undefined;
      if (machine.assignedToUserId) {
        const assignedUser = await ctx.db.get(machine.assignedToUserId);
        assignedToUserEmail = assignedUser?.email;
      }
      result.push({
        ...machine,
        assignedToUserEmail,
      });
    }

    return result;
  },
});

export const listAllMachinesForAdmin = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('machines'),
      _creationTime: v.number(),
      name: v.string(),
      make: v.string(),
      model: v.string(),
      serialNumber: v.optional(v.string()),
      type: v.union(
        v.literal('Laptop'),
        v.literal('Desktop'),
        v.literal('Server')
      ),
      ramGb: v.number(),
      storageCapacityGb: v.number(),
      storageType: v.union(v.literal('SSD'), v.literal('HDD')),
      graphicsCardName: v.string(),
      processorName: v.string(),
      assignedToUserId: v.optional(v.id('users')),
      assignedToUserEmail: v.optional(v.string()),
      status: v.union(
        v.literal('Available'),
        v.literal('Assigned'),
        v.literal('In Use'),
        v.literal('Maintenance'),
        v.literal('Retired'),
        v.literal('Decommissioned'),
        v.literal('Lost')
      ),
    })
  ),
  handler: async ctx => {
    const machines = await ctx.db.query('machines').collect();
    const result = [];
    for (const machine of machines) {
      let assignedToUserEmail: string | undefined = undefined;
      if (machine.assignedToUserId) {
        const assignedUser = await ctx.db.get(machine.assignedToUserId);
        assignedToUserEmail = assignedUser?.email;
      }
      result.push({
        ...machine,
        assignedToUserEmail,
      });
    }
    return result;
  },
});

/**
 * Search machines by assignedToUserId and/or name. Returns at most 10 results.
 */
export const searchMachines = internalQuery({
  args: {
    assignedToUserId: v.optional(v.id('users')),
    name: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id('machines'),
      _creationTime: v.number(),
      name: v.string(),
      make: v.string(),
      model: v.string(),
      serialNumber: v.optional(v.string()),
      type: v.union(
        v.literal('Laptop'),
        v.literal('Desktop'),
        v.literal('Server')
      ),
      ramGb: v.number(),
      storageCapacityGb: v.number(),
      storageType: v.union(v.literal('SSD'), v.literal('HDD')),
      graphicsCardName: v.string(),
      processorName: v.string(),
      assignedToUserId: v.optional(v.id('users')),
      assignedToUserEmail: v.optional(v.string()),
      status: v.union(
        v.literal('Available'),
        v.literal('Assigned'),
        v.literal('In Use'),
        v.literal('Maintenance'),
        v.literal('Retired'),
        v.literal('Decommissioned'),
        v.literal('Lost')
      ),
    })
  ),
  handler: async (ctx, args) => {
    let machines;

    // If assignedToUserId is provided, use the index
    if (args.assignedToUserId !== undefined) {
      machines = await ctx.db
        .query('machines')
        .withIndex('by_assigned_to_user_id', q =>
          q.eq('assignedToUserId', args.assignedToUserId)
        )
        .collect();
    } else {
      // Otherwise, get all machines
      machines = await ctx.db.query('machines').collect();
    }

    // Filter by name if provided (case-insensitive partial match)
    if (args.name !== undefined && args.name.trim() !== '') {
      const searchTerm = args.name.toLowerCase();
      machines = machines.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm)
      );
    }

    // Limit to 10 results
    machines = machines.slice(0, 10);

    // Add assignedToUserEmail for each machine
    const result = [];
    for (const machine of machines) {
      let assignedToUserEmail: string | undefined = undefined;
      if (machine.assignedToUserId) {
        const assignedUser = await ctx.db.get(machine.assignedToUserId);
        assignedToUserEmail = assignedUser?.email;
      }
      result.push({
        ...machine,
        assignedToUserEmail,
      });
    }

    return result;
  },
});

/**
 * Create a machine with direct values.
 */
export const createMachine = mutation({
  args: {
    name: v.string(),
    make: v.string(),
    model: v.string(),
    serialNumber: v.optional(v.string()),
    type: v.union(
      v.literal('Laptop'),
      v.literal('Desktop'),
      v.literal('Server')
    ),
    ramGb: v.number(),
    storageCapacityGb: v.number(),
    storageType: v.union(v.literal('SSD'), v.literal('HDD')),
    graphicsCardName: v.string(),
    processorName: v.string(),
    assignedToUserId: v.optional(v.id('users')),
    status: v.union(
      v.literal('Available'),
      v.literal('Assigned'),
      v.literal('In Use'),
      v.literal('Maintenance'),
      v.literal('Retired'),
      v.literal('Decommissioned'),
      v.literal('Lost')
    ),
  },
  returns: v.id('machines'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    // Create the machine
    return await ctx.db.insert('machines', {
      name: args.name,
      make: args.make,
      model: args.model,
      serialNumber: args.serialNumber,
      type: args.type,
      ramGb: args.ramGb,
      storageCapacityGb: args.storageCapacityGb,
      storageType: args.storageType,
      graphicsCardName: args.graphicsCardName,
      processorName: args.processorName,
      assignedToUserId: args.assignedToUserId,
      status: args.status,
    });
  },
});

/**
 * Internal mutation to create a machine (for seeding/testing).
 * Does not require authentication.
 */
export const createMachineInternal = internalMutation({
  args: {
    name: v.string(),
    make: v.string(),
    model: v.string(),
    serialNumber: v.optional(v.string()),
    type: v.union(
      v.literal('Laptop'),
      v.literal('Desktop'),
      v.literal('Server')
    ),
    ramGb: v.number(),
    storageCapacityGb: v.number(),
    storageType: v.union(v.literal('SSD'), v.literal('HDD')),
    graphicsCardName: v.string(),
    processorName: v.string(),
    assignedToUserId: v.optional(v.id('users')),
    status: v.union(
      v.literal('Available'),
      v.literal('Assigned'),
      v.literal('In Use'),
      v.literal('Maintenance'),
      v.literal('Retired'),
      v.literal('Decommissioned'),
      v.literal('Lost')
    ),
  },
  returns: v.id('machines'),
  handler: async (ctx, args) => {
    // Create the machine without auth check
    return await ctx.db.insert('machines', {
      name: args.name,
      make: args.make,
      model: args.model,
      serialNumber: args.serialNumber,
      type: args.type,
      ramGb: args.ramGb,
      storageCapacityGb: args.storageCapacityGb,
      storageType: args.storageType,
      graphicsCardName: args.graphicsCardName,
      processorName: args.processorName,
      assignedToUserId: args.assignedToUserId,
      status: args.status,
    });
  },
});

/**
 * Update a machine.
 */
export const updateMachine = mutation({
  args: {
    machineId: v.id('machines'),
    name: v.string(),
    make: v.string(),
    model: v.string(),
    serialNumber: v.optional(v.string()),
    type: v.union(
      v.literal('Laptop'),
      v.literal('Desktop'),
      v.literal('Server')
    ),
    ramGb: v.number(),
    storageCapacityGb: v.number(),
    storageType: v.union(v.literal('SSD'), v.literal('HDD')),
    graphicsCardName: v.string(),
    processorName: v.string(),
    assignedToUserId: v.optional(v.id('users')),
    status: v.union(
      v.literal('Available'),
      v.literal('Assigned'),
      v.literal('In Use'),
      v.literal('Maintenance'),
      v.literal('Retired'),
      v.literal('Decommissioned'),
      v.literal('Lost')
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const machine = await ctx.db.get(args.machineId);
    if (!machine) {
      throw new Error('Machine not found');
    }

    // Update the machine
    await ctx.db.patch(args.machineId, {
      name: args.name,
      make: args.make,
      model: args.model,
      serialNumber: args.serialNumber,
      type: args.type,
      ramGb: args.ramGb,
      storageCapacityGb: args.storageCapacityGb,
      storageType: args.storageType,
      graphicsCardName: args.graphicsCardName,
      processorName: args.processorName,
      assignedToUserId: args.assignedToUserId,
      status: args.status,
    });
    return null;
  },
});

/**
 * Get a machine with its details.
 */
export const getMachineWithDetails = query({
  args: { machineId: v.id('machines') },
  returns: v.union(
    v.null(),
    v.object({
      machine: v.object({
        _id: v.id('machines'),
        _creationTime: v.number(),
        name: v.string(),
        make: v.string(),
        model: v.string(),
        serialNumber: v.optional(v.string()),
        type: v.union(
          v.literal('Laptop'),
          v.literal('Desktop'),
          v.literal('Server')
        ),
        ramGb: v.number(),
        storageCapacityGb: v.number(),
        storageType: v.union(v.literal('SSD'), v.literal('HDD')),
        graphicsCardName: v.string(),
        processorName: v.string(),
        assignedToUserId: v.optional(v.id('users')),
        status: v.union(
          v.literal('Available'),
          v.literal('Assigned'),
          v.literal('In Use'),
          v.literal('Maintenance'),
          v.literal('Retired'),
          v.literal('Decommissioned'),
          v.literal('Lost')
        ),
      }),
      assignedToUser: v.union(
        v.null(),
        v.object({
          _id: v.id('users'),
          name: v.string(),
          email: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const machine = await ctx.db.get(args.machineId);
    if (!machine) {
      return null;
    }
    let assignedToUser = null;
    if (machine.assignedToUserId) {
      const user = await ctx.db.get(machine.assignedToUserId);
      if (user) {
        assignedToUser = {
          _id: user._id,
          name: user.name,
          email: user.email,
        };
      }
    }
    return {
      machine,
      assignedToUser,
    };
  },
});

/**
 * Migration: Set name field for all machines that don't have it.
 * This adds a default name "PIPPAOS001", "PIPPAOS002", etc.
 * Public mutation for migration purposes.
 */
export const migrateMachineNames = mutation({
  args: {},
  returns: v.object({
    updated: v.number(),
    message: v.string(),
  }),
  handler: async ctx => {
    // Skip auth check for migration - this is a one-time operation
    const machines = await ctx.db.query('machines').collect();
    let counter = 1;
    let updated = 0;

    for (const machine of machines) {
      // Check if machine has name field (for machines created before name was added)
      if (!('name' in machine) || !machine.name || machine.name.trim() === '') {
        const name = `PIPPAOS${String(counter).padStart(3, '0')}`;
        await ctx.db.patch(machine._id, { name });
        updated++;
        counter++;
      }
    }

    return {
      updated,
      message: `Updated ${updated} machine(s) with names PIPPAOS001${updated > 1 ? ` through PIPPAOS${String(counter - 1).padStart(3, '0')}` : ''}`,
    };
  },
});
