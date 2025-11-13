import { createTool } from '@convex-dev/agent';
import { internal } from '../../_generated/api';
import { z } from 'zod';
import { resolveUserId } from '../helpers/userIdResolution';
import { serializeTicket } from '../helpers/serialization';
import type { Id } from '../../_generated/dataModel';

/**
 * Tool to get tickets assigned to the current user.
 */
export const getMyAssignedTickets = createTool({
  description:
    'Retrieve all tickets assigned to the current user. Returns a list of tickets with their details including name, description, status, and creator information.',
  args: z.object({}),
  handler: async (
    ctx
  ): Promise<
    Array<{
      _id: string;
      _creationTime: string;
      userId: string;
      userName: string;
      userEmail?: string;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo?: string;
      assignedToName?: string;
      assignedToEmail?: string;
      teamId?: string;
      teamName?: string;
      updatedTime: string;
    }>
  > => {
    const { userId } = await resolveUserId(ctx, {
      toolName: 'getMyAssignedTickets',
    });

    // Call the internal query to get assigned tickets
    const tickets = await ctx.runQuery(
      internal.tickets.listTicketsAssignedToUser,
      {
        userId,
      }
    );

    // Ensure we return a plain array that can be serialized
    const result = tickets.map(ticket => serializeTicket(ticket));

    return result;
  },
});

/**
 * Tool to get tickets created by the current user.
 */
export const getMyCreatedTickets = createTool({
  description:
    'Retrieve all tickets created by the current user. Returns a list of tickets with their details including name, description, status, and assignee information (if assigned).',
  args: z.object({}),
  handler: async (
    ctx
  ): Promise<
    Array<{
      _id: string;
      _creationTime: string;
      userId: string;
      userName: string;
      userEmail?: string;
      name: string;
      description: string;
      status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo?: string;
      assignedToName?: string;
      assignedToEmail?: string;
      teamId?: string;
      teamName?: string;
      updatedTime: string;
    }>
  > => {
    const { userId } = await resolveUserId(ctx, {
      toolName: 'getMyCreatedTickets',
    });

    // Call the internal query to get created tickets
    const tickets = await ctx.runQuery(
      internal.tickets.listTicketsCreatedByUser,
      {
        userId,
      }
    );

    // Ensure we return a plain array that can be serialized
    const result = tickets.map(ticket => serializeTicket(ticket));

    return result;
  },
});

/**
 * Tool to create a ticket.
 */
export const createTicket = createTool({
  description:
    'Create a new support ticket. Tickets can be used to report issues, request assistance, or track problems. You can optionally assign it to a specific user and/or link it to specific machines.',
  args: z.object({
    name: z
      .string()
      .min(1)
      .describe(
        'A brief title or name for the ticket (e.g., "Laptop screen issue")'
      ),
    description: z
      .string()
      .min(1)
      .describe('A detailed description of the issue or request'),
    status: z
      .enum(['Open', 'Assigned', 'Closed', 'On Hold', 'Awaiting'])
      .optional()
      .describe('The status of the ticket. Defaults to "Open" if not provided'),
    assignedTo: z
      .string()
      .optional()
      .describe(
        'Optional: The Convex ID (_id) of a user to assign this ticket to. Use searchUsers to find user Convex IDs.'
      ),
    machineIds: z
      .array(z.string())
      .optional()
      .describe(
        'Optional: An array of machine Convex IDs (_id) to associate with this ticket. Use machine search/query tools to find machine IDs.'
      ),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    ticketId: string;
    name: string;
    description: string;
    status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
    success: boolean;
  }> => {
    const { userId } = await resolveUserId(ctx, {
      toolName: 'createTicket',
    });

    // Validate inputs
    if (!args.name || !args.name.trim()) {
      throw new Error('Ticket name is required');
    }
    if (!args.description || !args.description.trim()) {
      throw new Error('Ticket description is required');
    }

    // Validate assignedTo Convex ID if provided
    let assignedToConvexId: Id<'users'> | undefined = undefined;
    if (args.assignedTo) {
      // Verify the user exists
      const user = await ctx.runQuery(internal.users.getUserById, {
        userId: args.assignedTo as Id<'users'>,
      });
      if (!user) {
        throw new Error(`User with Convex ID ${args.assignedTo} not found`);
      }
      assignedToConvexId = args.assignedTo as Id<'users'>;
    }

    // Convert machine IDs to proper type if provided
    let machineConvexIds: Array<Id<'machines'>> | undefined = undefined;
    if (args.machineIds && args.machineIds.length > 0) {
      machineConvexIds = args.machineIds as Array<Id<'machines'>>;
    }

    // Call the internal mutation to create the ticket
    const ticketId = await ctx.runMutation(
      internal.tickets.createTicketForUser,
      {
        userId,
        name: args.name.trim(),
        description: args.description.trim(),
        status: args.status || 'Open',
        assignedTo: assignedToConvexId,
        machineIds: machineConvexIds,
      }
    );

    return {
      ticketId: String(ticketId),
      name: args.name.trim(),
      description: args.description.trim(),
      status: args.status || 'Open',
      success: true,
    };
  },
});

/**
 * Tool to update an existing ticket.
 * Allowed parameters (all optional): status, assignedTo, name, description.
 * - status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting' - The ticket status
 * - assignedTo: The Convex ID (_id) of a user to assign this ticket to, or null to unassign. Use searchUsers to find user Convex IDs.
 * - name: A brief title or name for the ticket
 * - description: A detailed description of the issue or request
 */
export const updateTicket = createTool({
  description:
    'Update an existing ticket. Allowed parameters (all optional): status, assignedTo, name, description. You can update any combination of these fields. Only provide the fields you want to change. Status can be "Open", "Assigned", "Closed", "On Hold", or "Awaiting". For assignedTo, provide a user Convex ID (_id) (use searchUsers to find user Convex IDs) or null to unassign.',
  args: z.object({
    ticketId: z.string().describe('The ID of the ticket to update'),
    status: z
      .enum(['Open', 'Assigned', 'Closed', 'On Hold', 'Awaiting'])
      .optional()
      .describe(
        'The status of the ticket. Allowed values: "Open", "Assigned", "Closed", "On Hold", "Awaiting"'
      ),
    assignedTo: z
      .union([z.string(), z.null()])
      .optional()
      .describe(
        'The Convex ID (_id) of a user to assign this ticket to. Use searchUsers to find user Convex IDs. Provide null to unassign the ticket.'
      ),
    name: z
      .string()
      .optional()
      .describe('A brief title or name for the ticket'),
    description: z
      .string()
      .optional()
      .describe('A detailed description of the issue or request'),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    ticketId: string;
    success: boolean;
    updatedFields: string[];
  }> => {
    // Ensure user is authenticated (userId not needed for update operation)
    await resolveUserId(ctx, {
      toolName: 'updateTicket',
    });

    // Validate that at least one field is being updated
    const updateFields = ['status', 'assignedTo', 'name', 'description'];
    const hasUpdates = updateFields.some(
      field => args[field as keyof typeof args] !== undefined
    );

    if (!hasUpdates) {
      throw new Error('At least one field must be provided to update');
    }

    // Track which fields are being updated
    const updatedFields: string[] = [];
    if (args.status !== undefined) updatedFields.push('status');
    if (args.assignedTo !== undefined) updatedFields.push('assignedTo');
    if (args.name !== undefined) updatedFields.push('name');
    if (args.description !== undefined) updatedFields.push('description');

    // Build the mutation args, only including fields that are explicitly provided
    const mutationArgs: {
      ticketId: Id<'tickets'>;
      name?: string;
      description?: string;
      status?: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
      assignedTo?: Id<'users'> | null;
    } = {
      ticketId: args.ticketId as Id<'tickets'>,
    };

    if (args.name !== undefined) {
      mutationArgs.name = args.name;
    }
    if (args.description !== undefined) {
      mutationArgs.description = args.description;
    }
    if (args.status !== undefined) {
      mutationArgs.status = args.status;
    }
    if (args.assignedTo !== undefined) {
      if (args.assignedTo === null) {
        mutationArgs.assignedTo = null;
      } else {
        // Validate the Convex ID exists
        const user = await ctx.runQuery(internal.users.getUserById, {
          userId: args.assignedTo as Id<'users'>,
        });
        if (!user) {
          throw new Error(`User with Convex ID ${args.assignedTo} not found`);
        }
        mutationArgs.assignedTo = args.assignedTo as Id<'users'>;
      }
    }

    // Call the internal mutation to update the ticket
    const ticketId = await ctx.runMutation(
      internal.tickets.updateTicketForUser,
      mutationArgs
    );

    return {
      ticketId: String(ticketId),
      success: true,
      updatedFields,
    };
  },
});

/**
 * Tool to get a ticket by ID.
 */
export const getTicketById = createTool({
  description:
    'Retrieve detailed information about a specific ticket by its ID. Returns the ticket details including name, description, status, creator information, assigned user information (if assigned), and all notes associated with the ticket.',
  args: z.object({
    ticketId: z.string().describe('The ID of the ticket to retrieve'),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    _id: string;
    _creationTime: string;
    userId: string;
    userName: string;
    userEmail?: string;
    name: string;
    description: string;
    status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
    assignedTo?: string;
    assignedToName?: string;
    assignedToEmail?: string;
    teamId?: string;
    teamName?: string;
    updatedTime: string;
    notes: Array<{
      _id: string;
      _creationTime: string;
      entityTable: string;
      entityId: string;
      content: string;
      createdBy: string;
      createdByEmail?: string;
    }>;
  } | null> => {
    // Ensure user is authenticated
    await resolveUserId(ctx, {
      toolName: 'getTicketById',
    });

    // Call the internal query to get the ticket
    const ticket = await ctx.runQuery(internal.tickets.getTicketById, {
      ticketId: args.ticketId as Id<'tickets'>,
    });

    if (!ticket) {
      return null;
    }

    // Ensure we return a plain object that can be serialized
    const result = serializeTicket(ticket);

    // Serialize notes as well
    const serializedNotes = ticket.notes.map(note => ({
      _id: String(note._id),
      _creationTime: new Date(note._creationTime).toISOString(),
      entityTable: note.entityTable,
      entityId: note.entityId,
      content: note.content,
      createdBy: String(note.createdBy),
      createdByEmail: note.createdByEmail,
    }));

    return {
      ...result,
      notes: serializedNotes,
    };
  },
});
