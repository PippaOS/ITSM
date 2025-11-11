import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import type { Id } from './_generated/dataModel';

/**
 * Create a tag for an entity (machine, user, ticket, etc.).
 */
export const createTag = mutation({
  args: {
    entityTable: v.string(),
    entityId: v.string(),
    key: v.string(),
    value: v.string(),
  },
  returns: v.id('tags'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    // Get or create the current user
    const userId: Id<'users'> = await ctx.runMutation(api.users.store, {});

    const tagId = await ctx.db.insert('tags', {
      entityTable: args.entityTable,
      entityId: args.entityId,
      key: args.key,
      value: args.value,
      createdBy: userId,
    });

    // Update ticket timestamp if this tag is for a ticket
    if (args.entityTable === 'tickets') {
      await ctx.runMutation(internal.tickets.updateTicketTimestamp, {
        ticketId: args.entityId as Id<'tickets'>,
      });
    }

    return tagId;
  },
});

/**
 * List all tags for a specific entity.
 */
export const listTags = query({
  args: {
    entityTable: v.string(),
    entityId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id('tags'),
      _creationTime: v.number(),
      entityTable: v.string(),
      entityId: v.string(),
      key: v.string(),
      value: v.string(),
      createdBy: v.id('users'),
      createdByEmail: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const tags = await ctx.db
      .query('tags')
      .withIndex('by_entity_table_and_id', q =>
        q.eq('entityTable', args.entityTable).eq('entityId', args.entityId)
      )
      .order('asc')
      .collect();

    const result = [];
    for (const tag of tags) {
      const user = await ctx.db.get(tag.createdBy);
      result.push({
        _id: tag._id,
        _creationTime: tag._creationTime,
        entityTable: tag.entityTable,
        entityId: tag.entityId,
        key: tag.key,
        value: tag.value,
        createdBy: tag.createdBy,
        createdByEmail: user?.email ?? undefined,
      });
    }
    return result;
  },
});

/**
 * Update a tag.
 */
export const updateTag = mutation({
  args: {
    tagId: v.id('tags'),
    key: v.string(),
    value: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const tag = await ctx.db.get(args.tagId);
    if (!tag) {
      throw new Error('Tag not found');
    }

    await ctx.db.patch(args.tagId, {
      key: args.key,
      value: args.value,
    });

    // Update ticket timestamp if this tag is for a ticket
    if (tag.entityTable === 'tickets') {
      await ctx.runMutation(internal.tickets.updateTicketTimestamp, {
        ticketId: tag.entityId as Id<'tickets'>,
      });
    }

    return null;
  },
});

/**
 * Delete a tag.
 */
export const deleteTag = mutation({
  args: {
    tagId: v.id('tags'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const tag = await ctx.db.get(args.tagId);
    if (!tag) {
      throw new Error('Tag not found');
    }

    await ctx.db.delete(args.tagId);

    // Update ticket timestamp if this tag was for a ticket
    if (tag.entityTable === 'tickets') {
      await ctx.runMutation(internal.tickets.updateTicketTimestamp, {
        ticketId: tag.entityId as Id<'tickets'>,
      });
    }

    return null;
  },
});
