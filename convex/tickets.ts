import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from './_generated/server';
import { v } from 'convex/values';
import type { Id, Doc } from './_generated/dataModel';
import { getAuthUserId } from './utils';

/**
 * List all tickets.
 */
export const listTickets = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
    })
  ),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get all tickets
    const tickets = await ctx.db.query('tickets').order('desc').collect();

    // Enrich tickets with user information
    const result: Array<{
      _id: Id<'tickets'>;
      _creationTime: number;
      userId: Id<'users'>;
      userName: string;
      userEmail: string | undefined;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo: Id<'users'> | undefined;
      assignedToName: string | undefined;
      assignedToEmail: string | undefined;
      teamId: Id<'teams'> | undefined;
      teamName: string | undefined;
      updatedTime: number;
    }> = [];
    for (const ticket of tickets) {
      const ticketUser = await ctx.db.get(ticket.userId);
      let assignedToUser: Doc<'users'> | null = null;
      if (ticket.assignedTo) {
        assignedToUser = await ctx.db.get(ticket.assignedTo);
      }
      let team: Doc<'teams'> | null = null;
      if (ticket.teamId) {
        team = await ctx.db.get(ticket.teamId);
      }

      result.push({
        _id: ticket._id,
        _creationTime: ticket._creationTime,
        userId: ticket.userId,
        userName: ticketUser?.name ?? 'Unknown',
        userEmail: ticketUser?.email,
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        assignedToName: assignedToUser?.name,
        assignedToEmail: assignedToUser?.email,
        teamId: ticket.teamId,
        teamName: team?.name,
        updatedTime: ticket.updatedTime,
      });
    }

    return result;
  },
});

/**
 * List tickets created by the current user.
 */
export const listTicketsCreatedByCurrentUser = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
    })
  ),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get tickets created by this user
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .order('desc')
      .collect();

    // Enrich tickets with user information
    const result: Array<{
      _id: Id<'tickets'>;
      _creationTime: number;
      userId: Id<'users'>;
      userName: string;
      userEmail: string | undefined;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo: Id<'users'> | undefined;
      assignedToName: string | undefined;
      assignedToEmail: string | undefined;
      teamId: Id<'teams'> | undefined;
      teamName: string | undefined;
      updatedTime: number;
    }> = [];
    for (const ticket of tickets) {
      const ticketUser = await ctx.db.get(ticket.userId);
      let assignedToUser: Doc<'users'> | null = null;
      if (ticket.assignedTo) {
        assignedToUser = await ctx.db.get(ticket.assignedTo);
      }
      let team: Doc<'teams'> | null = null;
      if (ticket.teamId) {
        team = await ctx.db.get(ticket.teamId);
      }

      result.push({
        _id: ticket._id,
        _creationTime: ticket._creationTime,
        userId: ticket.userId,
        userName: ticketUser?.name ?? 'Unknown',
        userEmail: ticketUser?.email,
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        assignedToName: assignedToUser?.name,
        assignedToEmail: assignedToUser?.email,
        teamId: ticket.teamId,
        teamName: team?.name,
        updatedTime: ticket.updatedTime,
      });
    }

    return result;
  },
});

/**
 * List tickets assigned to the current user.
 */
export const listTicketsAssignedToCurrentUser = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
    })
  ),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get tickets assigned to this user
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('by_assigned_to', q => q.eq('assignedTo', userId))
      .order('desc')
      .collect();

    // Enrich tickets with user information
    const result: Array<{
      _id: Id<'tickets'>;
      _creationTime: number;
      userId: Id<'users'>;
      userName: string;
      userEmail: string | undefined;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo: Id<'users'> | undefined;
      assignedToName: string | undefined;
      assignedToEmail: string | undefined;
      teamId: Id<'teams'> | undefined;
      teamName: string | undefined;
      updatedTime: number;
    }> = [];
    for (const ticket of tickets) {
      const ticketUser = await ctx.db.get(ticket.userId);
      let assignedToUser: Doc<'users'> | null = null;
      if (ticket.assignedTo) {
        assignedToUser = await ctx.db.get(ticket.assignedTo);
      }
      let team: Doc<'teams'> | null = null;
      if (ticket.teamId) {
        team = await ctx.db.get(ticket.teamId);
      }

      result.push({
        _id: ticket._id,
        _creationTime: ticket._creationTime,
        userId: ticket.userId,
        userName: ticketUser?.name ?? 'Unknown',
        userEmail: ticketUser?.email,
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        assignedToName: assignedToUser?.name,
        assignedToEmail: assignedToUser?.email,
        teamId: ticket.teamId,
        teamName: team?.name,
        updatedTime: ticket.updatedTime,
      });
    }

    return result;
  },
});

/**
 * List tickets linked to a specific machine.
 */
export const listTicketsByMachine = query({
  args: { machineId: v.id('machines') },
  returns: v.array(
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get ticket-machine relationships for this machine
    const ticketMachines = await ctx.db
      .query('ticketMachines')
      .withIndex('by_machine_id', q => q.eq('machineId', args.machineId))
      .collect();

    // Get all related tickets
    const result: Array<{
      _id: Id<'tickets'>;
      _creationTime: number;
      userId: Id<'users'>;
      userName: string;
      userEmail: string | undefined;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo: Id<'users'> | undefined;
      assignedToName: string | undefined;
      assignedToEmail: string | undefined;
      teamId: Id<'teams'> | undefined;
      teamName: string | undefined;
      updatedTime: number;
    }> = [];
    for (const ticketMachine of ticketMachines) {
      const ticket = await ctx.db.get(ticketMachine.ticketId);
      if (!ticket) continue;

      const ticketUser = await ctx.db.get(ticket.userId);
      let assignedToUser: Doc<'users'> | null = null;
      if (ticket.assignedTo) {
        assignedToUser = await ctx.db.get(ticket.assignedTo);
      }
      let team: Doc<'teams'> | null = null;
      if (ticket.teamId) {
        team = await ctx.db.get(ticket.teamId);
      }

      result.push({
        _id: ticket._id,
        _creationTime: ticket._creationTime,
        userId: ticket.userId,
        userName: ticketUser?.name ?? 'Unknown',
        userEmail: ticketUser?.email,
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        assignedToName: assignedToUser?.name,
        assignedToEmail: assignedToUser?.email,
        teamId: ticket.teamId,
        teamName: team?.name,
        updatedTime: ticket.updatedTime,
      });
    }

    // Sort by creation time descending
    result.sort((a, b) => b._creationTime - a._creationTime);

    return result;
  },
});

/**
 * Get a ticket by ID.
 */
export const getTicket = query({
  args: { ticketId: v.id('tickets') },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      return null;
    }

    const ticketUser = await ctx.db.get(ticket.userId);
    let assignedToUser: Doc<'users'> | null = null;
    if (ticket.assignedTo) {
      assignedToUser = await ctx.db.get(ticket.assignedTo);
    }
    let team: Doc<'teams'> | null = null;
    if (ticket.teamId) {
      team = await ctx.db.get(ticket.teamId);
    }

    return {
      _id: ticket._id,
      _creationTime: ticket._creationTime,
      userId: ticket.userId,
      userName: ticketUser?.name ?? 'Unknown',
      userEmail: ticketUser?.email,
      name: ticket.name,
      description: ticket.description,
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      assignedToName: assignedToUser?.name,
      assignedToEmail: assignedToUser?.email,
      teamId: ticket.teamId,
      teamName: team?.name,
      updatedTime: ticket.updatedTime,
    };
  },
});

/**
 * Create a new ticket.
 */
export const createTicket = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('Open'),
      v.literal('Assigned'),
      v.literal('Closed'),
      v.literal('On Hold'),
      v.literal('Awaiting')
    ),
    assignedTo: v.optional(v.id('users')),
    teamId: v.optional(v.id('teams')),
    machineIds: v.optional(v.array(v.id('machines'))), // Optional array of machine IDs
  },
  returns: v.id('tickets'),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // If teamId is provided, verify the team exists
    if (args.teamId) {
      const team = await ctx.db.get(args.teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // If assignedTo is provided with a teamId, verify the user is a member of the team
      if (args.assignedTo) {
        const teamMembers = await ctx.db
          .query('teamMembers')
          .withIndex('by_team_id', q => q.eq('teamId', args.teamId!))
          .collect();
        const isMember = teamMembers.some(tm => tm.userId === args.assignedTo);
        if (!isMember) {
          throw new Error('Assigned user is not a member of the selected team');
        }
      }
    }

    // If machineIds are provided, verify all machines exist
    if (args.machineIds && args.machineIds.length > 0) {
      for (const machineId of args.machineIds) {
        const machine = await ctx.db.get(machineId);
        if (!machine) {
          throw new Error(`Machine with ID ${machineId} not found`);
        }
      }
    }

    // Create the ticket
    const now = Date.now();
    const ticketId = await ctx.db.insert('tickets', {
      userId,
      name: args.name.trim(),
      description: args.description.trim(),
      status: args.status,
      assignedTo: args.assignedTo,
      teamId: args.teamId,
      updatedTime: now,
    });

    // Create ticket-machine relationships if machines are provided
    if (args.machineIds && args.machineIds.length > 0) {
      for (const machineId of args.machineIds) {
        await ctx.db.insert('ticketMachines', {
          ticketId,
          machineId,
        });
      }
    }

    return ticketId;
  },
});

/**
 * Update an existing ticket.
 */
export const updateTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      )
    ),
    assignedTo: v.optional(v.union(v.id('users'), v.null())),
    teamId: v.optional(v.union(v.id('teams'), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Determine the effective teamId (new value or current value)
    const effectiveTeamId =
      args.teamId !== undefined ? (args.teamId ?? undefined) : ticket.teamId;

    // If teamId is being set (not null/undefined), verify the team exists
    if (args.teamId !== undefined && args.teamId !== null) {
      const team = await ctx.db.get(args.teamId);
      if (!team) {
        throw new Error('Team not found');
      }
    }

    // Determine the effective assignedTo (new value or current value)
    const effectiveAssignedTo =
      args.assignedTo !== undefined
        ? (args.assignedTo ?? undefined)
        : ticket.assignedTo;

    // If we have both a team and an assigned user, verify the user is a member
    if (effectiveTeamId && effectiveAssignedTo) {
      const teamMembers = await ctx.db
        .query('teamMembers')
        .withIndex('by_team_id', q => q.eq('teamId', effectiveTeamId))
        .collect();
      const isMember = teamMembers.some(
        tm => tm.userId === effectiveAssignedTo
      );
      if (!isMember) {
        throw new Error('Assigned user is not a member of the selected team');
      }
    }

    const updates: {
      name?: string;
      description?: string;
      status?: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo?: Id<'users'>;
      teamId?: Id<'teams'>;
      updatedTime: number;
    } = {
      updatedTime: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }
    if (args.status !== undefined) {
      updates.status = args.status;
    }
    if (args.assignedTo !== undefined) {
      // Convert null to undefined since schema doesn't allow null
      updates.assignedTo = args.assignedTo ?? undefined;
    }
    if (args.teamId !== undefined) {
      // Convert null to undefined since schema doesn't allow null
      updates.teamId = args.teamId ?? undefined;
    }

    await ctx.db.patch(args.ticketId, updates);
    return null;
  },
});

/**
 * Internal mutation to create a ticket (for use in agent tools).
 */
export const createTicketForUser = internalMutation({
  args: {
    userId: v.id('users'), // Convex ID
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('Open'),
      v.literal('Assigned'),
      v.literal('Closed'),
      v.literal('On Hold'),
      v.literal('Awaiting')
    ),
    assignedTo: v.optional(v.id('users')), // Convex ID
    teamId: v.optional(v.id('teams')), // Convex ID
    machineIds: v.optional(v.array(v.id('machines'))), // Optional array of machine IDs
  },
  returns: v.id('tickets'),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // If teamId is provided, verify the team exists
    if (args.teamId) {
      const team = await ctx.db.get(args.teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // If assignedTo is provided with a teamId, verify the user is a member of the team
      if (args.assignedTo) {
        const teamMembers = await ctx.db
          .query('teamMembers')
          .withIndex('by_team_id', q => q.eq('teamId', args.teamId!))
          .collect();
        const isMember = teamMembers.some(tm => tm.userId === args.assignedTo);
        if (!isMember) {
          throw new Error('Assigned user is not a member of the selected team');
        }
      }
    }

    // If assignedTo is provided, verify the user exists
    if (args.assignedTo) {
      const assignedToUser = await ctx.db.get(args.assignedTo);
      if (!assignedToUser) {
        throw new Error('Assigned user not found');
      }
    }

    // If machineIds are provided, verify all machines exist
    if (args.machineIds && args.machineIds.length > 0) {
      for (const machineId of args.machineIds) {
        const machine = await ctx.db.get(machineId);
        if (!machine) {
          throw new Error(`Machine with ID ${machineId} not found`);
        }
      }
    }

    // Create the ticket
    const now = Date.now();
    const ticketId = await ctx.db.insert('tickets', {
      userId: args.userId,
      name: args.name.trim(),
      description: args.description.trim(),
      status: args.status,
      assignedTo: args.assignedTo,
      teamId: args.teamId,
      updatedTime: now,
    });

    // Create ticket-machine relationships if machines are provided
    if (args.machineIds && args.machineIds.length > 0) {
      for (const machineId of args.machineIds) {
        await ctx.db.insert('ticketMachines', {
          ticketId,
          machineId,
        });
      }
    }

    return ticketId;
  },
});

/**
 * Internal query to get tickets assigned to a user (for use in agent tools).
 */
export const listTicketsAssignedToUser = internalQuery({
  args: {
    userId: v.id('users'), // Convex ID
  },
  returns: v.array(
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get tickets assigned to this user
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('by_assigned_to', q => q.eq('assignedTo', args.userId))
      .order('desc')
      .collect();

    // Enrich tickets with user information
    const result: Array<{
      _id: Id<'tickets'>;
      _creationTime: number;
      userId: Id<'users'>;
      userName: string;
      userEmail: string | undefined;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo: Id<'users'> | undefined;
      assignedToName: string | undefined;
      assignedToEmail: string | undefined;
      teamId: Id<'teams'> | undefined;
      teamName: string | undefined;
      updatedTime: number;
    }> = [];
    for (const ticket of tickets) {
      const ticketUser = await ctx.db.get(ticket.userId);
      let assignedToUser: Doc<'users'> | null = null;
      if (ticket.assignedTo) {
        assignedToUser = await ctx.db.get(ticket.assignedTo);
      }
      let team: Doc<'teams'> | null = null;
      if (ticket.teamId) {
        team = await ctx.db.get(ticket.teamId);
      }

      result.push({
        _id: ticket._id,
        _creationTime: ticket._creationTime,
        userId: ticket.userId,
        userName: ticketUser?.name ?? 'Unknown',
        userEmail: ticketUser?.email,
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        assignedToName: assignedToUser?.name,
        assignedToEmail: assignedToUser?.email,
        teamId: ticket.teamId,
        teamName: team?.name,
        updatedTime: ticket.updatedTime,
      });
    }

    return result;
  },
});

/**
 * Internal query to get tickets created by a user (for use in agent tools).
 */
export const listTicketsCreatedByUser = internalQuery({
  args: {
    userId: v.id('users'), // Convex ID
  },
  returns: v.array(
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get tickets created by this user
    const tickets = await ctx.db
      .query('tickets')
      .withIndex('by_user_id', q => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    // Enrich tickets with user information
    const result: Array<{
      _id: Id<'tickets'>;
      _creationTime: number;
      userId: Id<'users'>;
      userName: string;
      userEmail: string | undefined;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo: Id<'users'> | undefined;
      assignedToName: string | undefined;
      assignedToEmail: string | undefined;
      teamId: Id<'teams'> | undefined;
      teamName: string | undefined;
      updatedTime: number;
    }> = [];
    for (const ticket of tickets) {
      const ticketUser = await ctx.db.get(ticket.userId);
      let assignedToUser: Doc<'users'> | null = null;
      if (ticket.assignedTo) {
        assignedToUser = await ctx.db.get(ticket.assignedTo);
      }
      let team: Doc<'teams'> | null = null;
      if (ticket.teamId) {
        team = await ctx.db.get(ticket.teamId);
      }

      result.push({
        _id: ticket._id,
        _creationTime: ticket._creationTime,
        userId: ticket.userId,
        userName: ticketUser?.name ?? 'Unknown',
        userEmail: ticketUser?.email,
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        assignedToName: assignedToUser?.name,
        assignedToEmail: assignedToUser?.email,
        teamId: ticket.teamId,
        teamName: team?.name,
        updatedTime: ticket.updatedTime,
      });
    }

    return result;
  },
});

/**
 * Internal query to get a ticket by ID (for use in agent tools).
 */
export const getTicketById = internalQuery({
  args: {
    ticketId: v.id('tickets'), // Convex ID
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('tickets'),
      _creationTime: v.number(),
      userId: v.id('users'),
      userName: v.string(),
      userEmail: v.optional(v.string()),
      name: v.string(),
      description: v.string(),
      status: v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      ),
      assignedTo: v.optional(v.id('users')),
      assignedToName: v.optional(v.string()),
      assignedToEmail: v.optional(v.string()),
      teamId: v.optional(v.id('teams')),
      teamName: v.optional(v.string()),
      updatedTime: v.number(),
      notes: v.array(
        v.object({
          _id: v.id('notes'),
          _creationTime: v.number(),
          entityTable: v.string(),
          entityId: v.string(),
          content: v.string(),
          createdBy: v.id('users'),
          createdByEmail: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      return null;
    }

    const ticketUser = await ctx.db.get(ticket.userId);
    let assignedToUser: Doc<'users'> | null = null;
    if (ticket.assignedTo) {
      assignedToUser = await ctx.db.get(ticket.assignedTo);
    }
    let team: Doc<'teams'> | null = null;
    if (ticket.teamId) {
      team = await ctx.db.get(ticket.teamId);
    }

    // Fetch notes for this ticket
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_entity_table_and_id', q =>
        q.eq('entityTable', 'tickets').eq('entityId', String(args.ticketId))
      )
      .order('desc')
      .collect();

    // Enrich notes with creator information
    const enrichedNotes: Array<{
      _id: Id<'notes'>;
      _creationTime: number;
      entityTable: string;
      entityId: string;
      content: string;
      createdBy: Id<'users'>;
      createdByEmail: string | undefined;
    }> = [];
    for (const note of notes) {
      const noteCreator = await ctx.db.get(note.createdBy);
      enrichedNotes.push({
        _id: note._id,
        _creationTime: note._creationTime,
        entityTable: note.entityTable,
        entityId: note.entityId,
        content: note.content,
        createdBy: note.createdBy,
        createdByEmail: noteCreator?.email ?? undefined,
      });
    }

    return {
      _id: ticket._id,
      _creationTime: ticket._creationTime,
      userId: ticket.userId,
      userName: ticketUser?.name ?? 'Unknown',
      userEmail: ticketUser?.email,
      name: ticket.name,
      description: ticket.description,
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      assignedToName: assignedToUser?.name,
      assignedToEmail: assignedToUser?.email,
      teamId: ticket.teamId,
      teamName: team?.name,
      updatedTime: ticket.updatedTime,
      notes: enrichedNotes,
    };
  },
});

/**
 * Add a machine to a ticket.
 */
export const addMachineToTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    machineId: v.id('machines'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify ticket exists
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Verify machine exists
    const machine = await ctx.db.get(args.machineId);
    if (!machine) {
      throw new Error('Machine not found');
    }

    // Check if relationship already exists
    const existing = await ctx.db
      .query('ticketMachines')
      .withIndex('by_ticket_id', q => q.eq('ticketId', args.ticketId))
      .collect();

    const alreadyExists = existing.some(tm => tm.machineId === args.machineId);
    if (alreadyExists) {
      throw new Error('Machine is already assigned to this ticket');
    }

    // Create the relationship
    await ctx.db.insert('ticketMachines', {
      ticketId: args.ticketId,
      machineId: args.machineId,
    });

    return null;
  },
});

/**
 * Remove a machine from a ticket.
 */
export const removeMachineFromTicket = mutation({
  args: {
    ticketId: v.id('tickets'),
    machineId: v.id('machines'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Find the relationship
    const ticketMachines = await ctx.db
      .query('ticketMachines')
      .withIndex('by_ticket_id', q => q.eq('ticketId', args.ticketId))
      .collect();

    const relationship = ticketMachines.find(
      tm => tm.machineId === args.machineId
    );

    if (!relationship) {
      throw new Error('Machine is not assigned to this ticket');
    }

    // Delete the relationship
    await ctx.db.delete(relationship._id);

    return null;
  },
});

/**
 * Get machines assigned to a ticket.
 */
export const getMachinesForTicket = query({
  args: {
    ticketId: v.id('tickets'),
  },
  returns: v.array(
    v.object({
      _id: v.id('machines'),
      _creationTime: v.number(),
      name: v.string(),
      make: v.string(),
      model: v.string(),
      type: v.union(
        v.literal('Laptop'),
        v.literal('Desktop'),
        v.literal('Server')
      ),
      status: v.union(
        v.literal('Available'),
        v.literal('Assigned'),
        v.literal('In Use'),
        v.literal('Maintenance'),
        v.literal('Retired'),
        v.literal('Decommissioned'),
        v.literal('Lost')
      ),
      assignedToUserId: v.optional(v.id('users')),
      assignedToUserName: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Get ticket-machine relationships
    const ticketMachines = await ctx.db
      .query('ticketMachines')
      .withIndex('by_ticket_id', q => q.eq('ticketId', args.ticketId))
      .collect();

    // Get machine details
    const result: Array<{
      _id: Id<'machines'>;
      _creationTime: number;
      name: string;
      make: string;
      model: string;
      type: 'Laptop' | 'Desktop' | 'Server';
      status:
        | 'Available'
        | 'Assigned'
        | 'In Use'
        | 'Maintenance'
        | 'Retired'
        | 'Decommissioned'
        | 'Lost';
      assignedToUserId: Id<'users'> | undefined;
      assignedToUserName: string | undefined;
    }> = [];
    for (const ticketMachine of ticketMachines) {
      const machine = await ctx.db.get(ticketMachine.machineId);
      if (!machine) continue;

      let assignedToUserName: string | undefined = undefined;
      if (machine.assignedToUserId) {
        const user = await ctx.db.get(machine.assignedToUserId);
        assignedToUserName = user?.name;
      }

      result.push({
        _id: machine._id,
        _creationTime: machine._creationTime,
        name: machine.name,
        make: machine.make,
        model: machine.model,
        type: machine.type,
        status: machine.status,
        assignedToUserId: machine.assignedToUserId,
        assignedToUserName,
      });
    }

    return result;
  },
});

/**
 * Internal mutation to update a ticket (for use in agent tools).
 */
export const updateTicketForUser = internalMutation({
  args: {
    ticketId: v.id('tickets'), // Convex ID
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('Open'),
        v.literal('Assigned'),
        v.literal('Closed'),
        v.literal('On Hold'),
        v.literal('Awaiting')
      )
    ),
    assignedTo: v.optional(v.union(v.id('users'), v.null())), // Convex ID, or null to unassign
    teamId: v.optional(v.union(v.id('teams'), v.null())), // Convex ID, or null to remove team
  },
  returns: v.id('tickets'),
  handler: async (ctx, args) => {
    // Get the ticket
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Determine the effective teamId (new value or current value)
    const effectiveTeamId =
      args.teamId !== undefined ? (args.teamId ?? undefined) : ticket.teamId;

    // If teamId is being set (not null/undefined), verify the team exists
    if (args.teamId !== undefined && args.teamId !== null) {
      const team = await ctx.db.get(args.teamId);
      if (!team) {
        throw new Error('Team not found');
      }
    }

    // Determine the effective assignedTo (new value or current value)
    const effectiveAssignedTo =
      args.assignedTo !== undefined
        ? (args.assignedTo ?? undefined)
        : ticket.assignedTo;

    // If we have both a team and an assigned user, verify the user is a member
    if (effectiveTeamId && effectiveAssignedTo) {
      const teamMembers = await ctx.db
        .query('teamMembers')
        .withIndex('by_team_id', q => q.eq('teamId', effectiveTeamId))
        .collect();
      const isMember = teamMembers.some(
        tm => tm.userId === effectiveAssignedTo
      );
      if (!isMember) {
        throw new Error('Assigned user is not a member of the selected team');
      }
    }

    // Build updates object
    const updates: {
      name?: string;
      description?: string;
      status?: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo?: Id<'users'>;
      teamId?: Id<'teams'>;
      updatedTime: number;
    } = {
      updatedTime: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }
    if (args.status !== undefined) {
      updates.status = args.status;
    }

    // Handle assignedTo - convert null to undefined
    if (args.assignedTo !== undefined) {
      if (args.assignedTo === null) {
        updates.assignedTo = undefined;
      } else {
        // Verify the user exists
        const assignedToUser = await ctx.db.get(args.assignedTo);
        if (!assignedToUser) {
          throw new Error('Assigned user not found');
        }
        updates.assignedTo = args.assignedTo;
      }
    }

    // Handle teamId - convert null to undefined
    if (args.teamId !== undefined) {
      updates.teamId = args.teamId ?? undefined;
    }

    // Apply updates
    await ctx.db.patch(args.ticketId, updates);

    return args.ticketId;
  },
});

/**
 * Helper internal mutation to update a ticket's updatedTime.
 * Called when related entities (notes, tags) are modified.
 */
export const updateTicketTimestamp = internalMutation({
  args: {
    ticketId: v.id('tickets'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    await ctx.db.patch(args.ticketId, {
      updatedTime: Date.now(),
    });

    return null;
  },
});
