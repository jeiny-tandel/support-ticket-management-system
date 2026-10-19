import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CommentState, TicketComment } from '../../types';
import { fetchComments, createComment } from './commentsThunk';

const initialState: CommentState = {
  ticketId: null,
  comments: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  submitError: null,
};

/**
 * Inserts a comment while preserving chronological order and avoiding duplicates.
 * Fast path: appends directly in O(1) time if chronologically next.
 * Edge case: inserts at proper position if network jitter delivered it out of order.
 */
const insertComment = (
  comments: TicketComment[],
  newComment: TicketComment,
): void => {
  const exists = comments.some((c) => c._id === newComment._id);
  if (exists) return;

  const newTime = new Date(newComment.createdAt).getTime();
  const lastComment = comments[comments.length - 1];

  // Common case: new comment is created after existing comments (O(1) append)
  if (!lastComment || newTime >= new Date(lastComment.createdAt).getTime()) {
    comments.push(newComment);
    return;
  }

  // Edge case: out-of-order arrival; find insertion point from the end
  let i = comments.length - 1;
  while (i >= 0 && new Date(comments[i].createdAt).getTime() > newTime) {
    i--;
  }
  comments.splice(i + 1, 0, newComment);
};

export const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setCommentTicketId: (state, action: PayloadAction<string>) => {
      if (state.ticketId !== action.payload) {
        state.ticketId = action.payload;
        state.comments = [];
        state.isLoading = true;
        state.error = null;
        state.submitError = null;
      }
    },
    commentReceived: (state, action: PayloadAction<TicketComment>) => {
      if (!state.ticketId || state.ticketId !== action.payload.ticketId) {
        return;
      }
      insertComment(state.comments, action.payload);
    },
    clearComments: (state) => {
      state.ticketId = null;
      state.comments = [];
      state.isLoading = false;
      state.isSubmitting = false;
      state.error = null;
      state.submitError = null;
    },
    clearCommentErrors: (state) => {
      state.error = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchComments
    builder
      .addCase(fetchComments.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.ticketId = action.meta.arg;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ticketId = action.payload.ticketId;
        state.comments = action.payload.comments;
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to load comments';
      });

    // createComment
    builder
      .addCase(createComment.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitError = null;
        if (state.ticketId === action.payload.ticketId) {
          insertComment(state.comments, action.payload);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to post comment';
      });
  },
});

export const {
  setCommentTicketId,
  commentReceived,
  clearComments,
  clearCommentErrors,
} = commentsSlice.actions;

export const commentsReducer = commentsSlice.reducer;
export default commentsSlice.reducer;
