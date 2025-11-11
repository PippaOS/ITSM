import { createTool } from '@convex-dev/agent';
import { internal } from '../../_generated/api';
import { z } from 'zod';
import { resolveUserId } from '../helpers/userIdResolution';

/**
 * Tool to get notes for any entity (machines, users, tickets, etc.).
 */
export const getNotesForEntity = createTool({
  description:
    'Get all notes for a specific entity in the system. You need to provide the entity table name and entity ID. Available entity tables: "machines", "users", "tickets". Returns a list of notes with their content, creation time, and creator information.',
  args: z.object({
    entityTable: z
      .string()
      .describe(
        'The table name of the entity. Must be one of: "machines", "users", "tickets"'
      ),
    entityId: z.string().describe('The ID of the entity to get notes for'),
  }),
  handler: async (
    ctx,
    args
  ): Promise<
    Array<{
      _id: string;
      _creationTime: string;
      entityTable: string;
      entityId: string;
      content: string;
      createdBy: string;
      createdByEmail?: string;
    }>
  > => {
    // Validate inputs
    if (!args.entityTable || !args.entityId) {
      throw new Error('entityTable and entityId are required');
    }

    // Call the internal query to get notes
    const notes = await ctx.runQuery(internal.notes.listNotesForEntity, {
      entityTable: args.entityTable,
      entityId: args.entityId,
    });

    // Convert IDs and timestamps to strings for serialization
    return notes.map(note => ({
      _id: String(note._id),
      _creationTime: new Date(note._creationTime).toISOString(),
      entityTable: note.entityTable,
      entityId: note.entityId,
      content: note.content,
      createdBy: String(note.createdBy),
      createdByEmail: note.createdByEmail,
    }));
  },
});

/**
 * Tool to add a note to any entity (machines, users, tickets, etc.).
 */
export const addNoteToEntity = createTool({
  description:
    'Add a note to any entity in the system. You need to provide the entity table name and entity ID. Available entity tables: "machines", "users", "tickets". The note will be associated with the entity and visible to anyone who views that entity.',
  args: z.object({
    entityTable: z
      .string()
      .describe(
        'The table name of the entity. Must be one of: "machines", "users", "tickets"'
      ),
    entityId: z.string().describe('The ID of the entity to add a note to'),
    content: z.string().min(1).describe('The content of the note to add.'),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    noteId: string;
    entityTable: string;
    entityId: string;
    content: string;
    success: boolean;
  }> => {
    const { userId } = await resolveUserId(ctx, {
      toolName: 'addNoteToEntity',
    });

    // Validate inputs
    if (!args.entityTable || !args.entityId || !args.content.trim()) {
      throw new Error('entityTable, entityId, and content are all required');
    }

    // Call the internal mutation to create the note
    const noteId = await ctx.runMutation(internal.notes.createNoteForEntity, {
      userId,
      entityTable: args.entityTable,
      entityId: args.entityId,
      content: args.content.trim(),
    });

    return {
      noteId: String(noteId),
      entityTable: args.entityTable,
      entityId: args.entityId,
      content: args.content.trim(),
      success: true,
    };
  },
});
