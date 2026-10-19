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
    const rawComments = await getTicketCommentsApi(ticketId);

    // Deduplicate comments by _id to guard against duplicate entries
    const commentMap = new Map<string, TicketComment>();
    for (const c of rawComments) {
      if (c && c._id) {
        commentMap.set(c._id, c);
      }
    }

    // Sort chronologically (oldest to newest) before dispatching to slice
    const comments = Array.from(commentMap.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

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
