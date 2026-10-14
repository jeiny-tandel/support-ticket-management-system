import { apiClient } from './axios';
import type {
  Ticket,
  PaginatedTicketsResponse,
  GetTicketsParams,
  CreateTicketPayload,
  AssignTicketPayload,
  UpdateTicketStatusPayload,
  TicketComment,
  CreateCommentPayload,
} from '../types';

/**
 * Fetches tickets with optional status, priority, and pagination query parameters.
 * Backend endpoint: GET /tickets
 */
export const getTicketsApi = async (
  params?: GetTicketsParams,
): Promise<PaginatedTicketsResponse> => {
  const response = await apiClient.get<PaginatedTicketsResponse>('/tickets', {
    params,
  });
  return response.data;
};

/**
 * Creates a new ticket. (Admin only)
 * Backend endpoint: POST /tickets
 * Payload: { title, description, priority }
 */
export const createTicketApi = async (
  payload: CreateTicketPayload,
): Promise<Ticket> => {
  const response = await apiClient.post<Ticket>('/tickets', payload);
  return response.data;
};

/**
 * Assigns an existing ticket to a Support Agent. (Admin only)
 * Backend endpoint: PATCH /tickets/:id/assign
 * Payload: { assignedToId }
 */
export const assignTicketApi = async (
  ticketId: string,
  payload: AssignTicketPayload,
): Promise<Ticket> => {
  const response = await apiClient.patch<Ticket>(
    `/tickets/${ticketId}/assign`,
    payload,
  );
  return response.data;
};

/**
 * Updates the status of an existing ticket.
 * Backend endpoint: PATCH /tickets/:id/status
 * Payload: { status }
 */
export const updateTicketStatusApi = async (
  ticketId: string,
  payload: UpdateTicketStatusPayload,
): Promise<Ticket> => {
  const response = await apiClient.patch<Ticket>(
    `/tickets/${ticketId}/status`,
    payload,
  );
  return response.data;
};

/**
 * Retrieves comments for a specific ticket in chronological order.
 * Backend endpoint: GET /tickets/:id/comments
 */
export const getTicketCommentsApi = async (
  ticketId: string,
): Promise<TicketComment[]> => {
  const response = await apiClient.get<TicketComment[]>(
    `/tickets/${ticketId}/comments`,
  );
  return response.data;
};

/**
 * Creates a new comment on a specific ticket.
 * Backend endpoint: POST /tickets/:id/comments
 * Payload: { message }
 */
export const createTicketCommentApi = async (
  ticketId: string,
  payload: CreateCommentPayload,
): Promise<TicketComment> => {
  const response = await apiClient.post<TicketComment>(
    `/tickets/${ticketId}/comments`,
    payload,
  );
  return response.data;
};

