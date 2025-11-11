import { query, mutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import type { Doc } from './_generated/dataModel';

export const store = mutation({
  args: {},
  returns: v.id('users'),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Called store without authentication');
    }

    const displayName =
      identity.name ?? identity.nickname ?? identity.email ?? 'Anonymous';

    const existing = await ctx.db
      .query('users')
      .withIndex('by_external_id', q => q.eq('externalId', identity.subject))
      .unique();

    if (existing !== null) {
      const updates: Partial<Doc<'users'>> = {};
      if (existing.name !== displayName) {
        updates.name = displayName;
      }
      if (existing.email !== identity.email) {
        updates.email = identity.email;
      }
      if (existing.tokenIdentifier !== identity.tokenIdentifier) {
        updates.tokenIdentifier = identity.tokenIdentifier;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }

      return existing._id;
    }

    return await ctx.db.insert('users', {
      name: displayName,
      email: identity.email,
      externalId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
    });
  },
});

export const current = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('users'),
      name: v.string(),
      email: v.optional(v.string()),
      externalId: v.string(),
      tokenIdentifier: v.string(),
      theme: v.optional(v.union(v.literal('light'), v.literal('dark'))),
    })
  ),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_external_id', q => q.eq('externalId', identity.subject))
      .unique();

    if (user === null) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      externalId: user.externalId,
      tokenIdentifier: user.tokenIdentifier,
      theme: user.theme,
    };
  },
});

/**
 * List all users.
 */
export const listUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
      externalId: v.string(),
      tokenIdentifier: v.string(),
      theme: v.optional(v.union(v.literal('light'), v.literal('dark'))),
    })
  ),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.query('users').collect();
  },
});

/**
 * Get a user by ID.
 */
export const getUser = query({
  args: { userId: v.id('users') },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
      externalId: v.string(),
      tokenIdentifier: v.string(),
      theme: v.optional(v.union(v.literal('light'), v.literal('dark'))),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    return await ctx.db.get(args.userId);
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    externalId: v.string(),
    tokenIdentifier: v.string(),
  },
  returns: v.id('users'),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    // Check if a user with this externalId already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_external_id', q => q.eq('externalId', args.externalId))
      .first();
    if (existing) {
      throw new Error('User with this external ID already exists');
    }

    return await ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      externalId: args.externalId,
      tokenIdentifier: args.tokenIdentifier,
    });
  },
});

/**
 * Update an existing user.
 */
export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    email: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const existing = await ctx.db.get(args.userId);
    if (!existing) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.userId, {
      name: args.name,
      email: args.email,
    });
    return null;
  },
});

/**
 * Update the current user's theme preference.
 */
export const updateTheme = mutation({
  args: {
    theme: v.union(v.literal('light'), v.literal('dark')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_external_id', q => q.eq('externalId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(user._id, {
      theme: args.theme,
    });
    return null;
  },
});

/**
 * Internal query to get user Convex ID from externalId.
 * Used by agent tools to convert externalId strings to Convex IDs.
 */
export const getUserByExternalId = internalQuery({
  args: {
    externalId: v.string(),
  },
  returns: v.union(v.id('users'), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_external_id', q => q.eq('externalId', args.externalId))
      .unique();

    return user?._id ?? null;
  },
});

/**
 * Internal query to get user by Convex ID.
 * Used by agent tools to validate user IDs.
 */
export const getUserById = internalQuery({
  args: {
    userId: v.id('users'),
  },
  returns: v.union(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
      externalId: v.string(),
      tokenIdentifier: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    return {
      _id: user._id,
      _creationTime: user._creationTime,
      name: user.name,
      email: user.email,
      externalId: user.externalId,
      tokenIdentifier: user.tokenIdentifier,
    };
  },
});

export const searchUsers = internalQuery({
  args: {
    searchTerm: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
      externalId: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase().trim();
    if (!searchTerm) {
      return [];
    }

    const allUsers = await ctx.db.query('users').collect();

    // Filter users where name or email contains the search term (case-insensitive)
    return allUsers
      .filter(user => {
        const nameMatch = user.name.toLowerCase().includes(searchTerm);
        const emailMatch =
          user.email?.toLowerCase().includes(searchTerm) ?? false;
        return nameMatch || emailMatch;
      })
      .map(user => ({
        _id: user._id,
        _creationTime: user._creationTime,
        name: user.name,
        email: user.email,
        externalId: user.externalId,
      }));
  },
});
