import { getMyAssets } from './assets';
import { addNoteToEntity, getNotesForEntity } from './notes';
import {
  createTicket,
  getMyAssignedTickets,
  getMyCreatedTickets,
  updateTicket,
  getTicketById,
} from './tickets';
import { searchUsers } from './searchUsers';
import { searchMachines } from './machines';
import { getCurrentDateTime } from './datetime';

// All available tools
const ALL_TOOLS = {
  getMyAssets,
  addNoteToEntity,
  getNotesForEntity,
  createTicket,
  getMyAssignedTickets,
  getMyCreatedTickets,
  updateTicket,
  getTicketById,
  searchUsers,
  searchMachines,
  getCurrentDateTime,
};

// Re-export for external use
export { getMyAssets } from './assets';
export { addNoteToEntity, getNotesForEntity } from './notes';
export {
  createTicket,
  getMyAssignedTickets,
  getMyCreatedTickets,
  updateTicket,
  getTicketById,
} from './tickets';
export { searchUsers } from './searchUsers';
export { searchMachines } from './machines';
export { getCurrentDateTime } from './datetime';

/**
 * Get all available tools in the system.
 */
export function getAllTools() {
  return ALL_TOOLS;
}
