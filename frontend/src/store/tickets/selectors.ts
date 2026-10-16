import type { RootState } from '../store';

export const selectTicketState = (state: RootState) => state.tickets;
export const selectTickets = (state: RootState) => state.tickets.items;
export const selectTicketsTotal = (state: RootState) => state.tickets.total;
export const selectTicketsPage = (state: RootState) => state.tickets.page;
export const selectTicketsLimit = (state: RootState) => state.tickets.limit;
export const selectTicketsLoading = (state: RootState) => state.tickets.isLoading;
export const selectTicketsError = (state: RootState) => state.tickets.error;
export const selectStatusFilter = (state: RootState) => state.tickets.statusFilter;
export const selectPriorityFilter = (state: RootState) => state.tickets.priorityFilter;
export const selectSearchQuery = (state: RootState) => state.tickets.searchQuery;

export const selectCurrentTicket = (state: RootState) => state.tickets.currentTicket;
export const selectCurrentTicketLoading = (state: RootState) => state.tickets.isDetailsLoading;
export const selectCurrentTicketError = (state: RootState) => state.tickets.detailsError;

export const selectTicketSubmitting = (state: RootState) => state.tickets.isSubmitting;
export const selectTicketSubmitError = (state: RootState) => state.tickets.submitError;

export const selectDeletedTickets = (state: RootState) => state.tickets.deletedItems;
export const selectDeletedTotal = (state: RootState) => state.tickets.deletedTotal;
export const selectDeletedPage = (state: RootState) => state.tickets.deletedPage;
export const selectDeletedLimit = (state: RootState) => state.tickets.deletedLimit;
export const selectDeletedLoading = (state: RootState) => state.tickets.isDeletedLoading;
export const selectDeletedError = (state: RootState) => state.tickets.deletedError;

export const selectTicketSummary = (state: RootState) => state.tickets.summary;
export const selectSummaryLoading = (state: RootState) => state.tickets.isSummaryLoading;
export const selectSummaryError = (state: RootState) => state.tickets.summaryError;

export const selectRecentTickets = (state: RootState) => state.tickets.recentTickets;
export const selectRecentLoading = (state: RootState) => state.tickets.isRecentLoading;
export const selectRecentError = (state: RootState) => state.tickets.recentError;

export const selectDeadlineMetrics = (state: RootState) => state.tickets.summary?.deadlines;
export const selectUrgentTickets = (state: RootState) => state.tickets.summary?.urgentTickets ?? [];
