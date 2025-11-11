import { query, mutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get a configuration value by key
 */
export const getConfig = query({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('appConfig')
      .withIndex('by_key', q => q.eq('key', args.key))
      .unique();

    return config?.value ?? null;
  },
});

/**
 * Internal query to get config value (used by backend)
 */
export const getConfigInternal = internalQuery({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('appConfig')
      .withIndex('by_key', q => q.eq('key', args.key))
      .unique();

    return config?.value ?? null;
  },
});

/**
 * Set a configuration value
 */
export const setConfig = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get the user
    const user = await ctx.db
      .query('users')
      .withIndex('by_token_identifier', q =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Check if config already exists
    const existingConfig = await ctx.db
      .query('appConfig')
      .withIndex('by_key', q => q.eq('key', args.key))
      .unique();

    if (existingConfig) {
      // Update existing config
      await ctx.db.patch(existingConfig._id, {
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      // Create new config
      await ctx.db.insert('appConfig', {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return null;
  },
});

/**
 * List all configuration values
 */
export const listConfig = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('appConfig'),
      _creationTime: v.number(),
      key: v.string(),
      value: v.string(),
      updatedAt: v.number(),
      updatedBy: v.optional(v.id('users')),
    })
  ),
  handler: async ctx => {
    const configs = await ctx.db.query('appConfig').collect();
    return configs;
  },
});
