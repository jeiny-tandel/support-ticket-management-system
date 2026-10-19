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

export const getTicketSummaryApi = async (): Promise<TicketSummaryResponse> => {
  const response = await apiClient.get<TicketSummaryResponse>('/tickets/summary');
  return response.data;
};

export const getTicketsApi = async (
  params?: GetTicketsParams,
): Promise<PaginatedTicketsResponse> => {
  const response = await apiClient.get<PaginatedTicketsResponse>('/tickets', {
    params,
  });
  return response.data;
};

export const getTicketByIdApi = async (ticketId: string): Promise<Ticket> => {
  const response = await apiClient.get<Ticket>(`/tickets/${ticketId}`);
  return response.data;
};

export const createTicketApi = async (
  payload: CreateTicketPayload,
): Promise<Ticket> => {
  const response = await apiClient.post<Ticket>('/tickets', payload);
  return response.data;
};

export const updateTicketApi = async (
  ticketId: string,
  payload: UpdateTicketPayload,
): Promise<Ticket> => {
  const response = await apiClient.patch<Ticket>(`/tickets/${ticketId}`, payload);
  return response.data;
};

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

export const getTicketCommentsApi = async (
  ticketId: string,
): Promise<TicketComment[]> => {
  const response = await apiClient.get<TicketComment[]>(
    `/tickets/${ticketId}/comments`,
  );
  return response.data;
};

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

export const deleteTicketApi = async (
  ticketId: string,
  payload: DeleteTicketPayload,
): Promise<Ticket> => {
  const response = await apiClient.delete<Ticket>(`/tickets/${ticketId}`, {
    data: payload,
  });
  return response.data;
};

export const getDeletedTicketsApi = async (
  params?: GetTicketsParams,
): Promise<PaginatedTicketsResponse> => {
  const response = await apiClient.get<PaginatedTicketsResponse>(
    '/tickets/deleted',
    { params },
  );
  return response.data;
};


