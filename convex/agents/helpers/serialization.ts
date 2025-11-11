/**
 * Serialize a machine/asset object to a plain JavaScript object.
 * Ensures all values are JSON-serializable.
 * Converts _creationTime from epoch milliseconds to ISO 8601 string.
 */
export function serializeMachine(machine: {
  _id: unknown;
  _creationTime: unknown;
  name: unknown;
  make: unknown;
  model: unknown;
  type: unknown;
  ramGb: unknown;
  storageCapacityGb: unknown;
  storageType: 'SSD' | 'HDD';
  graphicsCardName: unknown;
  processorName: unknown;
  assignedToUserId?: unknown;
  assignedToUserEmail?: unknown;
  status:
    | 'Available'
    | 'Assigned'
    | 'In Use'
    | 'Maintenance'
    | 'Retired'
    | 'Decommissioned'
    | 'Lost';
}): {
  _id: string;
  _creationTime: string;
  name: string;
  make: string;
  model: string;
  type: 'Laptop' | 'Desktop' | 'Server';
  ramGb: number;
  storageCapacityGb: number;
  storageType: 'SSD' | 'HDD';
  graphicsCardName: string;
  processorName: string;
  assignedToUserId?: string;
  assignedToUserEmail?: string;
  status:
    | 'Available'
    | 'Assigned'
    | 'In Use'
    | 'Maintenance'
    | 'Retired'
    | 'Decommissioned'
    | 'Lost';
} {
  return {
    _id: String(machine._id),
    _creationTime: new Date(Number(machine._creationTime)).toISOString(),
    name: String(machine.name),
    make: String(machine.make),
    model: String(machine.model),
    type: machine.type as 'Laptop' | 'Desktop' | 'Server',
    ramGb: Number(machine.ramGb),
    storageCapacityGb: Number(machine.storageCapacityGb),
    storageType: machine.storageType,
    graphicsCardName: String(machine.graphicsCardName),
    processorName: String(machine.processorName),
    assignedToUserId: machine.assignedToUserId
      ? String(machine.assignedToUserId)
      : undefined,
    assignedToUserEmail: machine.assignedToUserEmail
      ? String(machine.assignedToUserEmail)
      : undefined,
    status: machine.status,
  };
}

/**
 * Serialize a user object to a plain JavaScript object.
 * Note: externalId is excluded as tools should use Convex ID (_id) instead.
 * Converts _creationTime from epoch milliseconds to ISO 8601 string.
 */
export function serializeUser(user: {
  _id: unknown;
  _creationTime: unknown;
  name: unknown;
  email?: unknown;
  externalId?: unknown;
}): {
  _id: string;
  _creationTime: string;
  name: string;
  email?: string;
} {
  return {
    _id: String(user._id),
    _creationTime: new Date(Number(user._creationTime)).toISOString(),
    name: String(user.name),
    email: user.email ? String(user.email) : undefined,
  };
}

/**
 * Serialize a ticket object to a plain JavaScript object.
 * Converts _creationTime from epoch milliseconds to ISO 8601 string.
 */
export function serializeTicket(ticket: {
  _id: unknown;
  _creationTime: unknown;
  userId: unknown;
  userName: unknown;
  userEmail?: unknown;
  name: unknown;
  description: unknown;
  status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
  assignedTo?: unknown;
  assignedToName?: unknown;
  assignedToEmail?: unknown;
  machineId?: unknown;
  machineDisplayName?: unknown;
}): {
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
  machineId?: string;
  machineDisplayName?: string;
} {
  return {
    _id: String(ticket._id),
    _creationTime: new Date(Number(ticket._creationTime)).toISOString(),
    userId: String(ticket.userId),
    userName: String(ticket.userName),
    userEmail: ticket.userEmail ? String(ticket.userEmail) : undefined,
    name: String(ticket.name),
    description: String(ticket.description),
    status: ticket.status,
    assignedTo: ticket.assignedTo ? String(ticket.assignedTo) : undefined,
    assignedToName: ticket.assignedToName
      ? String(ticket.assignedToName)
      : undefined,
    assignedToEmail: ticket.assignedToEmail
      ? String(ticket.assignedToEmail)
      : undefined,
    machineId: ticket.machineId ? String(ticket.machineId) : undefined,
    machineDisplayName: ticket.machineDisplayName
      ? String(ticket.machineDisplayName)
      : undefined,
  };
}
