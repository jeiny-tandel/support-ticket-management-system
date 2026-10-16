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
  isDeleted?: boolean;
  deletionReason?: string | null;
  deletedById?: TicketUserSummary | string | null;
  deletedAt?: string | null;
  dueDate?: string | null;
}

export interface PaginatedTicketsResponse {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketPrioritySummary {
  low: number;
  medium: number;
  high: number;
}

export interface DeadlineMetrics {
  overdue: number;
  dueToday: number;
  dueSoon: number;
}

export interface UrgentTicketSummary {
  _id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  dueDate: string;
  assignedToId?: TicketUserSummary | null;
  createdAt: string;
}

export interface TicketSummaryResponse {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  unassigned: number;
  priorities: TicketPrioritySummary;
  deadlines: DeadlineMetrics;
  urgentTickets: UrgentTicketSummary[];
}

export interface GetTicketsParams {
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  dueDate?: string | null;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  dueDate?: string | null;
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

export interface DeleteTicketPayload {
  reason: string;
}

export type CommentCreatedEventPayload = TicketComment;

export interface TicketState {
  items: Ticket[];
  total: number;
  page: number;
  limit: number;
  searchQuery: string;
  statusFilter?: TicketStatus;
  priorityFilter?: TicketPriority;
  isLoading: boolean;
  error: string | null;

  currentTicket: Ticket | null;
  isDetailsLoading: boolean;
  detailsError: string | null;

  isSubmitting: boolean;
  submitError: string | null;

  deletedItems: Ticket[];
  deletedTotal: number;
  deletedPage: number;
  deletedLimit: number;
  isDeletedLoading: boolean;
  deletedError: string | null;

  summary: TicketSummaryResponse | null;
  isSummaryLoading: boolean;
  summaryError: string | null;
  recentTickets: Ticket[];
  isRecentLoading: boolean;
  recentError: string | null;
}

export interface CommentState {
  ticketId: string | null;
  comments: TicketComment[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submitError: string | null;
}
