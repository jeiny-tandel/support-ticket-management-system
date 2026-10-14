export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export const TICKET_STATUSES: readonly TicketStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

export const TICKET_PRIORITIES: readonly TicketPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
] as const;

/**
 * Safe user summary populated on ticket creator and assignee
 */
export interface TicketUserSummary {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: TicketUserSummary | string;
  assignedToId?: TicketUserSummary | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTicketsResponse {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetTicketsParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface AssignTicketPayload {
  assignedToId: string;
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
}

/**
 * Ticket comment returned by GET/POST /tickets/:id/comments
 * and broadcasted via Socket.IO comment:created event
 */
export interface TicketComment {
  _id: string;
  ticketId: string;
  authorId: TicketUserSummary;
  message: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCommentPayload {
  message: string;
}

export type CommentCreatedEventPayload = TicketComment;
