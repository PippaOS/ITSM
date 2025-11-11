import { query } from './_generated/server';
import { v } from 'convex/values';
import type { Id, TableNames } from './_generated/dataModel';

/**
 * Helper function to determine which table an entity belongs to based on its fields
 */
function determineTableFromEntity(
  entity: Record<string, unknown>
): string | null {
  // Check for machine-specific fields
  if (
    'ramGb' in entity &&
    'storageCapacityGb' in entity &&
    'storageType' in entity
  ) {
    return 'machines';
  }

  // Check for user-specific fields
  if ('email' in entity || ('name' in entity && 'externalId' in entity)) {
    return 'users';
  }

  // Check for ticket-specific fields
  if (
    'description' in entity &&
    'status' in entity &&
    'name' in entity &&
    !('ramGb' in entity)
  ) {
    return 'tickets';
  }

  // Check for note
  if ('content' in entity && 'entityId' in entity) {
    return 'notes';
  }

  // Check for tag
  if ('key' in entity && 'value' in entity && 'entityId' in entity) {
    return 'tags';
  }

  return null;
}

/**
 * Try to find an entity by ID across all tables.
 * Since Convex IDs encode their table, we can try to get the entity
 * and then determine which table it belongs to based on its structure.
 */
export const getEntityById = query({
  args: { id: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      table: v.string(),
      entity: v.any(),
    })
  ),
  handler: async (ctx, args) => {
    const id = args.id;

    // Try to fetch the entity - Convex will use the table encoded in the ID
    // We try multiple type casts since the ID might be from any table
    const tablesToTry: TableNames[] = [
      'machines',
      'users',
      'tickets',
      'notes',
      'tags',
    ];

    for (const tableName of tablesToTry) {
      try {
        const entity = await ctx.db.get(id as Id<typeof tableName>);
        if (entity !== null) {
          // Determine the actual table from the entity's structure
          const actualTable = determineTableFromEntity(entity);
          if (actualTable) {
            return { table: actualTable, entity };
          } else {
            // Fall back to the table name we tried
            return { table: tableName, entity };
          }
        }
      } catch {
        // Continue to next table attempt
        continue;
      }
    }

    return null;
  },
});
