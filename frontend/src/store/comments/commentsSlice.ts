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
      const exists = state.comments.some((c) => c._id === action.payload._id);
      if (!exists) {
        state.comments.push(action.payload);
        state.comments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      }
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
        const commentMap = new Map<string, TicketComment>();
        for (const c of action.payload.comments) {
          commentMap.set(c._id, c);
        }
        state.comments = Array.from(commentMap.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
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
          const exists = state.comments.some((c) => c._id === action.payload._id);
          if (!exists) {
            state.comments.push(action.payload);
            state.comments.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            );
          }
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
