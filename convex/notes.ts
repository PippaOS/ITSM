import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import type { Id } from './_generated/dataModel';

/**
 * Create a note for an entity (machine, user, ticket, etc.).
 */
export const createNote = mutation({
  args: {
    entityTable: v.string(),
    entityId: v.string(),
    content: v.string(),
  },
  returns: v.id('notes'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    // Get or create the current user
    const userId: Id<'users'> = await ctx.runMutation(api.users.store, {});

    const noteId = await ctx.db.insert('notes', {
      entityTable: args.entityTable,
      entityId: args.entityId,
      content: args.content,
      createdBy: userId,
    });

    // Update ticket timestamp if this note is for a ticket
    if (args.entityTable === 'tickets') {
      await ctx.runMutation(internal.tickets.updateTicketTimestamp, {
        ticketId: args.entityId as Id<'tickets'>,
      });
    }

    return noteId;
  },
});

/**
 * Update an existing note. Only the creator can update their note.
 */
export const updateNote = mutation({
  args: {
    noteId: v.id('notes'),
    content: v.string(),
  },
  returns: v.id('notes'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    // Get or create the current user
    const userId: Id<'users'> = await ctx.runMutation(api.users.store, {});

    // Get the note to verify ownership
    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error('Note not found');
    }

    // Only the creator can update the note
    if (note.createdBy !== userId) {
      throw new Error('Not authorized to update this note');
    }

    await ctx.db.patch(args.noteId, {
      content: args.content,
    });

    // Update ticket timestamp if this note is for a ticket
    if (note.entityTable === 'tickets') {
      await ctx.runMutation(internal.tickets.updateTicketTimestamp, {
        ticketId: note.entityId as Id<'tickets'>,
      });
    }

    return args.noteId;
  },
});

/**
 * List all notes for a specific entity.
 */
export const listNotes = query({
  args: {
    entityTable: v.string(),
    entityId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id('notes'),
      _creationTime: v.number(),
      entityTable: v.string(),
      entityId: v.string(),
      content: v.string(),
      createdBy: v.id('users'),
      createdByEmail: v.optional(v.string()),
      canEdit: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    // Get the current user ID (similar to users.current query)
    const currentUser = await ctx.db
      .query('users')
      .withIndex('by_external_id', q => q.eq('externalId', identity.subject))
      .unique();
    const userId = currentUser?._id ?? null;

    const notes = await ctx.db
      .query('notes')
      .withIndex('by_entity_table_and_id', q =>
        q.eq('entityTable', args.entityTable).eq('entityId', args.entityId)
      )
      .order('desc')
      .collect();

    const result = [];
    for (const note of notes) {
      const user = await ctx.db.get(note.createdBy);
      result.push({
        _id: note._id,
        _creationTime: note._creationTime,
        entityTable: note.entityTable,
        entityId: note.entityId,
        content: note.content,
        createdBy: note.createdBy,
        createdByEmail: user?.email ?? undefined,
        canEdit: userId !== null && note.createdBy === userId,
      });
    }
    return result;
  },
});

/**
 * Internal mutation to create a note for a machine (for use in agent tools).
 * Validates that the machine exists and is assigned to the user.
 */
export const createNoteForMachine = internalMutation({
  args: {
    userId: v.id('users'), // Convex ID
    machineId: v.id('machines'), // Convex ID
    content: v.string(),
  },
  returns: v.id('notes'),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get the machine and verify it exists and is assigned to this user
    const machine = await ctx.db.get(args.machineId);

    if (!machine) {
      throw new Error('Machine not found');
    }

    // Verify the machine is assigned to this user
    if (machine.assignedToUserId !== args.userId) {
      throw new Error(
        'Machine is not assigned to you. You can only add notes to your own assets.'
      );
    }

    // Create the note
    const noteId = await ctx.db.insert('notes', {
      entityTable: 'machines',
      entityId: String(args.machineId),
      content: args.content,
      createdBy: args.userId,
    });

    return noteId;
  },
});

/**
 * Internal mutation to create a note for any entity (for use in agent tools).
 * Similar to createNote but works from agent context without auth.
 * Validates that the entity exists.
 */
export const createNoteForEntity = internalMutation({
  args: {
    userId: v.id('users'), // Convex ID
    entityTable: v.string(), // e.g., 'machines', 'users', 'tickets'
    entityId: v.string(), // entity _id as string
    content: v.string(),
  },
  returns: v.id('notes'),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate that the entity exists
    // Convert entityId to the appropriate Id type based on entityTable
    let entityExists = false;
    try {
      switch (args.entityTable) {
        case 'machines': {
          const machine = await ctx.db.get(args.entityId as Id<'machines'>);
          entityExists = machine !== null;
          break;
        }
        case 'users': {
          const targetUser = await ctx.db.get(args.entityId as Id<'users'>);
          entityExists = targetUser !== null;
          break;
        }
        case 'tickets': {
          const ticket = await ctx.db.get(args.entityId as Id<'tickets'>);
          entityExists = ticket !== null;
          break;
        }
        default:
          // For unknown entity types, we'll still allow note creation
          entityExists = true; // Allow it to proceed
      }
    } catch (error) {
      throw new Error(
        `Invalid entity ID for table ${args.entityTable}: ${error}`
      );
    }

    if (!entityExists) {
      throw new Error(
        `Entity not found: ${args.entityTable} with id ${args.entityId}`
      );
    }

    // Create the note
    const noteId = await ctx.db.insert('notes', {
      entityTable: args.entityTable,
      entityId: args.entityId,
      content: args.content,
      createdBy: args.userId,
    });

    // Update ticket timestamp if this note is for a ticket
    if (args.entityTable === 'tickets') {
      await ctx.runMutation(internal.tickets.updateTicketTimestamp, {
        ticketId: args.entityId as Id<'tickets'>,
      });
    }

    return noteId;
  },
});

/**
 * Internal query to list all notes for a specific entity (for use in agent tools).
 * Similar to listNotes but works from agent context without auth.
 */
export const listNotesForEntity = internalQuery({
  args: {
    entityTable: v.string(),
    entityId: v.string(),
  },
  returns: v.array(
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
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_entity_table_and_id', q =>
        q.eq('entityTable', args.entityTable).eq('entityId', args.entityId)
      )
      .order('desc')
      .collect();

    const result = [];
    for (const note of notes) {
      const user = await ctx.db.get(note.createdBy);
      result.push({
        _id: note._id,
        _creationTime: note._creationTime,
        entityTable: note.entityTable,
        entityId: note.entityId,
        content: note.content,
        createdBy: note.createdBy,
        createdByEmail: user?.email ?? undefined,
      });
    }
    return result;
  },
});
