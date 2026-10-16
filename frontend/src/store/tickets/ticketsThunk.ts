import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTicketsApi,
  getTicketByIdApi,
  createTicketApi,
  updateTicketApi,
  assignTicketApi,
  updateTicketStatusApi,
  deleteTicketApi,
  getDeletedTicketsApi,
  getTicketSummaryApi,
} from '../../api/tickets.api';
import { normalizeApiError } from '../../api/axios';
import type {
  Ticket,
  PaginatedTicketsResponse,
  TicketSummaryResponse,
  GetTicketsParams,
  CreateTicketPayload,
  UpdateTicketPayload,
  AssignTicketPayload,
  UpdateTicketStatusPayload,
  DeleteTicketPayload,
} from '../../types';

export const fetchTickets = createAsyncThunk<
  PaginatedTicketsResponse,
  GetTicketsParams | undefined,
  { rejectValue: string }
>('tickets/fetchTickets', async (params, { rejectWithValue }) => {
  try {
    const response = await getTicketsApi(params);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const fetchTicketById = createAsyncThunk<
  Ticket,
  string,
  { rejectValue: string }
>('tickets/fetchTicketById', async (ticketId, { rejectWithValue }) => {
  try {
    const response = await getTicketByIdApi(ticketId);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const createTicket = createAsyncThunk<
  Ticket,
  CreateTicketPayload,
  { rejectValue: string }
>('tickets/createTicket', async (payload, { rejectWithValue }) => {
  try {
    const response = await createTicketApi(payload);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const updateTicket = createAsyncThunk<
  Ticket,
  { ticketId: string; payload: UpdateTicketPayload },
  { rejectValue: string }
>('tickets/updateTicket', async ({ ticketId, payload }, { rejectWithValue }) => {
  try {
    const response = await updateTicketApi(ticketId, payload);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const assignTicket = createAsyncThunk<
  Ticket,
  { ticketId: string; payload: AssignTicketPayload },
  { rejectValue: string }
>('tickets/assignTicket', async ({ ticketId, payload }, { rejectWithValue }) => {
  try {
    const response = await assignTicketApi(ticketId, payload);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const updateTicketStatus = createAsyncThunk<
  Ticket,
  { ticketId: string; payload: UpdateTicketStatusPayload },
  { rejectValue: string }
>('tickets/updateTicketStatus', async ({ ticketId, payload }, { rejectWithValue }) => {
  try {
    const response = await updateTicketStatusApi(ticketId, payload);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const deleteTicket = createAsyncThunk<
  Ticket,
  { ticketId: string; payload: DeleteTicketPayload },
  { rejectValue: string }
>('tickets/deleteTicket', async ({ ticketId, payload }, { rejectWithValue }) => {
  try {
    const response = await deleteTicketApi(ticketId, payload);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const fetchDeletedTickets = createAsyncThunk<
  PaginatedTicketsResponse,
  GetTicketsParams | undefined,
  { rejectValue: string }
>('tickets/fetchDeletedTickets', async (params, { rejectWithValue }) => {
  try {
    const response = await getDeletedTicketsApi(params);
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const fetchTicketSummary = createAsyncThunk<
  TicketSummaryResponse,
  void,
  { rejectValue: string }
>('tickets/fetchTicketSummary', async (_, { rejectWithValue }) => {
  try {
    const response = await getTicketSummaryApi();
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const fetchRecentTickets = createAsyncThunk<
  PaginatedTicketsResponse,
  void,
  { rejectValue: string }
>('tickets/fetchRecentTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await getTicketsApi({ page: 1, limit: 5 });
    return response;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});
