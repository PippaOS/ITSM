import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    externalId: v.string(),
    tokenIdentifier: v.string(),
    theme: v.optional(v.union(v.literal('light'), v.literal('dark'))),
  })
    .index('by_external_id', ['externalId'])
    .index('by_token_identifier', ['tokenIdentifier']),

  machines: defineTable({
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
  })
    .index('by_storage_type', ['storageType'])
    .index('by_assigned_to_user_id', ['assignedToUserId'])
    .index('by_status', ['status']),

  notes: defineTable({
    entityTable: v.string(),
    entityId: v.string(),
    content: v.string(),
    createdBy: v.id('users'),
  })
    .index('by_entity_table_and_id', ['entityTable', 'entityId'])
    .index('by_created_by', ['createdBy']),

  tags: defineTable({
    entityTable: v.string(),
    entityId: v.string(),
    key: v.string(),
    value: v.string(),
    createdBy: v.id('users'),
  })
    .index('by_entity_table_and_id', ['entityTable', 'entityId'])
    .index('by_created_by', ['createdBy'])
    .index('by_key', ['key']),

  tickets: defineTable({
    userId: v.id('users'),
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
    updatedTime: v.number(),
  })
    .index('by_user_id', ['userId'])
    .index('by_status', ['status'])
    .index('by_assigned_to', ['assignedTo'])
    .index('by_team_id', ['teamId']),

  ticketMachines: defineTable({
    ticketId: v.id('tickets'),
    machineId: v.id('machines'),
  })
    .index('by_ticket_id', ['ticketId'])
    .index('by_machine_id', ['machineId']),

  appConfig: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id('users')),
  }).index('by_key', ['key']),

  teams: defineTable({
    name: v.string(),
    description: v.string(),
  }),

  teamMembers: defineTable({
    teamId: v.id('teams'),
    userId: v.id('users'),
  })
    .index('by_team_id', ['teamId'])
    .index('by_user_id', ['userId']),
});
