import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from './utils';
import type { Id } from './_generated/dataModel';

/**
 * List all teams.
 */
export const listTeams = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('teams'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
    })
  ),
  handler: async ctx => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const teams = await ctx.db.query('teams').order('desc').collect();

    return teams.map(team => ({
      _id: team._id,
      _creationTime: team._creationTime,
      name: team.name,
      description: team.description,
    }));
  },
});

/**
 * Get a team by ID.
 */
export const getTeam = query({
  args: { teamId: v.id('teams') },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('teams'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      members: v.array(
        v.object({
          _id: v.id('users'),
          name: v.string(),
          email: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      return null;
    }

    // Get team members
    const teamMembers = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_id', q => q.eq('teamId', args.teamId))
      .collect();

    // Enrich with user information
    const members: Array<{
      _id: Id<'users'>;
      name: string;
      email: string | undefined;
    }> = [];
    for (const member of teamMembers) {
      const user = await ctx.db.get(member.userId);
      if (user) {
        members.push({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      }
    }

    return {
      _id: team._id,
      _creationTime: team._creationTime,
      name: team.name,
      description: team.description,
      members,
    };
  },
});

/**
 * List members of a team.
 */
export const listTeamMembers = query({
  args: { teamId: v.id('teams') },
  returns: v.array(
    v.object({
      _id: v.id('users'),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify team exists
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Get team members
    const teamMembers = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_id', q => q.eq('teamId', args.teamId))
      .collect();

    // Enrich with user information
    const result: Array<{
      _id: Id<'users'>;
      _creationTime: number;
      name: string;
      email: string | undefined;
    }> = [];
    for (const member of teamMembers) {
      const user = await ctx.db.get(member.userId);
      if (user) {
        result.push({
          _id: user._id,
          _creationTime: user._creationTime,
          name: user.name,
          email: user.email,
        });
      }
    }

    return result;
  },
});

/**
 * Get teams that a user belongs to.
 */
export const getTeamsForUser = query({
  args: { userId: v.optional(v.id('users')) },
  returns: v.array(
    v.object({
      _id: v.id('teams'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    // Use provided userId or default to current user
    const targetUserId = args.userId ?? currentUserId;

    // Get team memberships for this user
    const teamMembers = await ctx.db
      .query('teamMembers')
      .withIndex('by_user_id', q => q.eq('userId', targetUserId))
      .collect();

    // Get team details
    const result: Array<{
      _id: Id<'teams'>;
      _creationTime: number;
      name: string;
      description: string;
    }> = [];
    for (const membership of teamMembers) {
      const team = await ctx.db.get(membership.teamId);
      if (team) {
        result.push({
          _id: team._id,
          _creationTime: team._creationTime,
          name: team.name,
          description: team.description,
        });
      }
    }

    // Sort by creation time descending
    result.sort((a, b) => b._creationTime - a._creationTime);

    return result;
  },
});

/**
 * Create a new team.
 */
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  returns: v.id('teams'),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Create the team
    return await ctx.db.insert('teams', {
      name: args.name.trim(),
      description: args.description.trim(),
    });
  },
});

/**
 * Update an existing team.
 */
export const updateTeam = mutation({
  args: {
    teamId: v.id('teams'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const updates: {
      name?: string;
      description?: string;
    } = {};

    if (args.name !== undefined) {
      updates.name = args.name.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }

    await ctx.db.patch(args.teamId, updates);
    return null;
  },
});

/**
 * Add a user to a team.
 */
export const addMemberToTeam = mutation({
  args: {
    teamId: v.id('teams'),
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    // Verify team exists
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    const existing = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_id', q => q.eq('teamId', args.teamId))
      .collect();

    const alreadyMember = existing.some(tm => tm.userId === args.userId);
    if (alreadyMember) {
      throw new Error('User is already a member of this team');
    }

    // Create the membership
    await ctx.db.insert('teamMembers', {
      teamId: args.teamId,
      userId: args.userId,
    });

    return null;
  },
});

/**
 * Remove a user from a team.
 */
export const removeMemberFromTeam = mutation({
  args: {
    teamId: v.id('teams'),
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error('Not authenticated');
    }

    // Find the membership
    const teamMembers = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_id', q => q.eq('teamId', args.teamId))
      .collect();

    const membership = teamMembers.find(tm => tm.userId === args.userId);

    if (!membership) {
      throw new Error('User is not a member of this team');
    }

    // Delete the membership
    await ctx.db.delete(membership._id);

    return null;
  },
});

/**
 * Internal query to get a team by ID (for use in agent tools).
 */
export const getTeamById = internalQuery({
  args: {
    teamId: v.id('teams'),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id('teams'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
      members: v.array(
        v.object({
          _id: v.id('users'),
          name: v.string(),
          email: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      return null;
    }

    // Get team members
    const teamMembers = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_id', q => q.eq('teamId', args.teamId))
      .collect();

    // Enrich with user information
    const members: Array<{
      _id: Id<'users'>;
      name: string;
      email: string | undefined;
    }> = [];
    for (const member of teamMembers) {
      const user = await ctx.db.get(member.userId);
      if (user) {
        members.push({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      }
    }

    return {
      _id: team._id,
      _creationTime: team._creationTime,
      name: team.name,
      description: team.description,
      members,
    };
  },
});

/**
 * Internal query to list teams for a user (for use in agent tools).
 */
export const listTeamsForUser = internalQuery({
  args: {
    userId: v.id('users'),
  },
  returns: v.array(
    v.object({
      _id: v.id('teams'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get team memberships for this user
    const teamMembers = await ctx.db
      .query('teamMembers')
      .withIndex('by_user_id', q => q.eq('userId', args.userId))
      .collect();

    // Get team details
    const result: Array<{
      _id: Id<'teams'>;
      _creationTime: number;
      name: string;
      description: string;
    }> = [];
    for (const membership of teamMembers) {
      const team = await ctx.db.get(membership.teamId);
      if (team) {
        result.push({
          _id: team._id,
          _creationTime: team._creationTime,
          name: team.name,
          description: team.description,
        });
      }
    }

    // Sort by creation time descending
    result.sort((a, b) => b._creationTime - a._creationTime);

    return result;
  },
});

/**
 * Internal query to list all teams (for use in agent tools).
 */
export const listAllTeams = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id('teams'),
      _creationTime: v.number(),
      name: v.string(),
      description: v.string(),
    })
  ),
  handler: async ctx => {
    const teams = await ctx.db.query('teams').order('desc').collect();

    return teams.map(team => ({
      _id: team._id,
      _creationTime: team._creationTime,
      name: team.name,
      description: team.description,
    }));
  },
});

/**
 * Internal mutation to create a team (for use in agent tools).
 */
export const createTeamForUser = internalMutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  returns: v.id('teams'),
  handler: async (ctx, args) => {
    // Create the team
    return await ctx.db.insert('teams', {
      name: args.name.trim(),
      description: args.description.trim(),
    });
  },
});

/**
 * Internal mutation to add a member to a team (for use in agent tools).
 */
export const addMemberToTeamInternal = internalMutation({
  args: {
    teamId: v.id('teams'),
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Verify team exists
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    const existing = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_id', q => q.eq('teamId', args.teamId))
      .collect();

    const alreadyMember = existing.some(tm => tm.userId === args.userId);
    if (alreadyMember) {
      throw new Error('User is already a member of this team');
    }

    // Create the membership
    await ctx.db.insert('teamMembers', {
      teamId: args.teamId,
      userId: args.userId,
    });

    return null;
  },
});

/**
 * Internal mutation to remove a member from a team (for use in agent tools).
 */
export const removeMemberFromTeamInternal = internalMutation({
  args: {
    teamId: v.id('teams'),
    userId: v.id('users'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Find the membership
    const teamMembers = await ctx.db
      .query('teamMembers')
      .withIndex('by_team_id', q => q.eq('teamId', args.teamId))
      .collect();

    const membership = teamMembers.find(tm => tm.userId === args.userId);

    if (!membership) {
      throw new Error('User is not a member of this team');
    }

    // Delete the membership
    await ctx.db.delete(membership._id);

    return null;
  },
});
