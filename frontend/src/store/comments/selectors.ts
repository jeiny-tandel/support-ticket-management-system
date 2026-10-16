import type { RootState } from '../store';

export const selectCommentState = (state: RootState) => state.comments;
export const selectComments = (state: RootState) => state.comments.comments;
export const selectCommentsLoading = (state: RootState) =>
  state.comments.isLoading;
export const selectCommentsSubmitting = (state: RootState) =>
  state.comments.isSubmitting;
export const selectCommentsError = (state: RootState) => state.comments.error;
export const selectCommentSubmitError = (state: RootState) =>
  state.comments.submitError;
export const selectCommentTicketId = (state: RootState) =>
  state.comments.ticketId;
