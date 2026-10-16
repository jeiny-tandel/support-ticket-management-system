import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTicketCommentsApi,
  createTicketCommentApi,
} from '../../api/tickets.api';
import { normalizeApiError } from '../../api/axios';
import type { TicketComment, CreateCommentPayload } from '../../types';

export const fetchComments = createAsyncThunk<
  { ticketId: string; comments: TicketComment[] },
  string,
  { rejectValue: string }
>('comments/fetchComments', async (ticketId, { rejectWithValue }) => {
  try {
    const comments = await getTicketCommentsApi(ticketId);
    return { ticketId, comments };
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});

export const createComment = createAsyncThunk<
  TicketComment,
  { ticketId: string; payload: CreateCommentPayload },
  { rejectValue: string }
>('comments/createComment', async ({ ticketId, payload }, { rejectWithValue }) => {
  try {
    const comment = await createTicketCommentApi(ticketId, payload);
    return comment;
  } catch (error) {
    const normalized = normalizeApiError(error);
    return rejectWithValue(normalized.message);
  }
});
