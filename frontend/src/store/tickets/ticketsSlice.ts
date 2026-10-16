import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketState,
} from '../../types';
import {
  fetchTickets,
  fetchTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  updateTicketStatus,
  deleteTicket,
  fetchDeletedTickets,
  fetchTicketSummary,
  fetchRecentTickets,
} from './ticketsThunk';

const initialState: TicketState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  searchQuery: '',
  statusFilter: undefined,
  priorityFilter: undefined,
  isLoading: false,
  error: null,

  currentTicket: null,
  isDetailsLoading: false,
  detailsError: null,

  isSubmitting: false,
  submitError: null,

  deletedItems: [],
  deletedTotal: 0,
  deletedPage: 1,
  deletedLimit: 10,
  isDeletedLoading: false,
  deletedError: null,

  summary: null,
  isSummaryLoading: false,
  summaryError: null,
  recentTickets: [],
  isRecentLoading: false,
  recentError: null,
};

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setPagination: (
      state,
      action: PayloadAction<{ page: number; limit?: number }>,
    ) => {
      state.page = action.payload.page;
      if (action.payload.limit) {
        state.limit = action.payload.limit;
      }
    },
    setStatusFilter: (
      state,
      action: PayloadAction<TicketStatus | undefined>,
    ) => {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setPriorityFilter: (
      state,
      action: PayloadAction<TicketPriority | undefined>,
    ) => {
      state.priorityFilter = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = undefined;
      state.priorityFilter = undefined;
      state.page = 1;
    },
    setCurrentTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.currentTicket = action.payload;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
      state.detailsError = null;
    },
    setDeletedPagination: (
      state,
      action: PayloadAction<{ page: number; limit?: number }>,
    ) => {
      state.deletedPage = action.payload.page;
      if (action.payload.limit) {
        state.deletedLimit = action.payload.limit;
      }
    },
    clearTicketErrors: (state) => {
      state.error = null;
      state.detailsError = null;
      state.submitError = null;
      state.deletedError = null;
      state.summaryError = null;
      state.recentError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTickets
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.error = null;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to load tickets';
      });

    // fetchTicketById
    builder
      .addCase(fetchTicketById.pending, (state) => {
        state.isDetailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        state.currentTicket = action.payload;
        state.detailsError = null;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.detailsError = action.payload ?? 'Failed to load ticket details';
      });

    // createTicket
    builder
      .addCase(createTicket.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitError = null;
        // Keep summary in sync if already loaded
        if (state.summary) {
          state.summary.total += 1;
          state.summary.open += 1;
          state.summary.unassigned += 1;
          if (action.payload.priority === 'LOW') state.summary.priorities.low += 1;
          if (action.payload.priority === 'MEDIUM') state.summary.priorities.medium += 1;
          if (action.payload.priority === 'HIGH') state.summary.priorities.high += 1;
        }
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to create ticket';
      });

    // updateTicket
    builder
      .addCase(updateTicket.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitError = null;
        if (state.currentTicket && state.currentTicket._id === action.payload._id) {
          state.currentTicket = action.payload;
        }
        state.items = state.items.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        );
        state.recentTickets = state.recentTickets.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        );
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to update ticket';
      });

    // assignTicket
    builder
      .addCase(assignTicket.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(assignTicket.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitError = null;
        if (state.currentTicket && state.currentTicket._id === action.payload._id) {
          state.currentTicket = action.payload;
        }
        state.items = state.items.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        );
        state.recentTickets = state.recentTickets.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        );
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to assign ticket';
      });

    // updateTicketStatus
    builder
      .addCase(updateTicketStatus.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitError = null;
        if (state.currentTicket && state.currentTicket._id === action.payload._id) {
          state.currentTicket = action.payload;
        }
        state.items = state.items.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        );
        state.recentTickets = state.recentTickets.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        );
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to update ticket status';
      });

    // deleteTicket
    builder
      .addCase(deleteTicket.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitError = null;
        if (state.currentTicket && state.currentTicket._id === action.payload._id) {
          state.currentTicket = action.payload;
        }
        state.items = state.items.filter((t) => t._id !== action.payload._id);
        state.total = Math.max(0, state.total - 1);

        // Handle deleting the last item on the current page
        if (state.items.length === 0 && state.page > 1) {
          state.page -= 1;
        }

        state.recentTickets = state.recentTickets.filter(
          (t) => t._id !== action.payload._id,
        );

        if (state.summary) {
          state.summary.total = Math.max(0, state.summary.total - 1);
        }
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload ?? 'Failed to delete ticket';
      });

    // fetchDeletedTickets
    builder
      .addCase(fetchDeletedTickets.pending, (state) => {
        state.isDeletedLoading = true;
        state.deletedError = null;
      })
      .addCase(fetchDeletedTickets.fulfilled, (state, action) => {
        state.isDeletedLoading = false;
        state.deletedItems = action.payload.items;
        state.deletedTotal = action.payload.total;
        state.deletedPage = action.payload.page;
        state.deletedLimit = action.payload.limit;
        state.deletedError = null;
      })
      .addCase(fetchDeletedTickets.rejected, (state, action) => {
        state.isDeletedLoading = false;
        state.deletedError = action.payload ?? 'Failed to load deleted tickets';
      });

    // fetchTicketSummary
    builder
      .addCase(fetchTicketSummary.pending, (state) => {
        state.isSummaryLoading = true;
        state.summaryError = null;
      })
      .addCase(fetchTicketSummary.fulfilled, (state, action) => {
        state.isSummaryLoading = false;
        state.summary = action.payload;
        state.summaryError = null;
      })
      .addCase(fetchTicketSummary.rejected, (state, action) => {
        state.isSummaryLoading = false;
        state.summaryError = action.payload ?? 'Failed to load ticket metrics';
      });

    // fetchRecentTickets
    builder
      .addCase(fetchRecentTickets.pending, (state) => {
        state.isRecentLoading = true;
        state.recentError = null;
      })
      .addCase(fetchRecentTickets.fulfilled, (state, action) => {
        state.isRecentLoading = false;
        state.recentTickets = action.payload.items;
        state.recentError = null;
      })
      .addCase(fetchRecentTickets.rejected, (state, action) => {
        state.isRecentLoading = false;
        state.recentError = action.payload ?? 'Failed to load recent tickets';
      });
  },
});

export const {
  setPagination,
  setStatusFilter,
  setPriorityFilter,
  setSearchQuery,
  clearFilters,
  setCurrentTicket,
  clearCurrentTicket,
  setDeletedPagination,
  clearTicketErrors,
} = ticketsSlice.actions;

export const ticketsReducer = ticketsSlice.reducer;
export default ticketsSlice.reducer;
