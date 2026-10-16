import { apiClient } from './axios';
import type {
  Ticket,
  PaginatedTicketsResponse,
  TicketSummaryResponse,
  GetTicketsParams,
  CreateTicketPayload,
  UpdateTicketPayload,
  AssignTicketPayload,
  UpdateTicketStatusPayload,
  TicketComment,
  CreateCommentPayload,
  DeleteTicketPayload,
} from '../types';

/**
 * Retrieves ticket statistics summary for the dashboard.
 * Backend endpoint: GET /tickets/summary
 */
export const getTicketSummaryApi = async (): Promise<TicketSummaryResponse> => {
  const response = await apiClient.get<TicketSummaryResponse>('/tickets/summary');
  return response.data;
};

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
 * Fetches a single ticket by its unique identifier.
 * Backend endpoint: GET /tickets/:id
 */
export const getTicketByIdApi = async (ticketId: string): Promise<Ticket> => {
  const response = await apiClient.get<Ticket>(`/tickets/${ticketId}`);
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
 * Updates an existing ticket's details (title, description, priority). (Admin only)
 * Backend endpoint: PATCH /tickets/:id
 * Payload: { title?, description?, priority? }
 */
export const updateTicketApi = async (
  ticketId: string,
  payload: UpdateTicketPayload,
): Promise<Ticket> => {
  const response = await apiClient.patch<Ticket>(`/tickets/${ticketId}`, payload);
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

/**
 * Soft deletes an existing ticket with a mandatory deletion reason. (Admin only)
 * Backend endpoint: DELETE /tickets/:id
 * Payload: { reason }
 */
export const deleteTicketApi = async (
  ticketId: string,
  payload: DeleteTicketPayload,
): Promise<Ticket> => {
  const response = await apiClient.delete<Ticket>(`/tickets/${ticketId}`, {
    data: payload,
  });
  return response.data;
};

/**
 * Fetches soft-deleted tickets with optional filtering and pagination. (Admin only)
 * Backend endpoint: GET /tickets/deleted
 */
export const getDeletedTicketsApi = async (
  params?: GetTicketsParams,
): Promise<PaginatedTicketsResponse> => {
  const response = await apiClient.get<PaginatedTicketsResponse>(
    '/tickets/deleted',
    { params },
  );
  return response.data;
};


