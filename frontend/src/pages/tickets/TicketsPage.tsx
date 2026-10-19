import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, Select, Alert, Tooltip, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../constants/routes";
import { useAppDispatch, useAppSelector, useDebounce } from "../../hooks";
import {
  selectUserRole,
  selectTickets,
  selectTicketsTotal,
  selectTicketsPage,
  selectTicketsLimit,
  selectTicketsLoading,
  selectTicketsError,
  selectStatusFilter,
  selectPriorityFilter,
  selectSearchQuery,
  fetchTickets,
  setPagination,
  setStatusFilter,
  setPriorityFilter,
  setSearchQuery,
  clearFilters,
} from "../../store";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketUserSummary,
} from "../../types";
import { Button, TicketStatusBadge, TicketPriorityBadge } from "../../components/common";
import { TicketModal, DeleteTicketModal } from "./components";
import { renderDueDateBadge, getAvatarInitial, formatDate } from "../../utils";

export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  const tickets = useAppSelector(selectTickets);
  const total = useAppSelector(selectTicketsTotal);
  const page = useAppSelector(selectTicketsPage);
  const limit = useAppSelector(selectTicketsLimit);
  const loading = useAppSelector(selectTicketsLoading);
  const errorMessage = useAppSelector(selectTicketsError);
  const statusFilter = useAppSelector(selectStatusFilter);
  const priorityFilter = useAppSelector(selectPriorityFilter);
  const searchQuery = useAppSelector(selectSearchQuery);
  const [searchInput, setSearchInput] = useState<string>(searchQuery);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [createModalOpen, setCreateModalOpen] = useState<boolean>(() => {
    const navState = location.state as { openCreateModal?: boolean } | null;
    return Boolean(navState?.openCreateModal && isAdmin);
  });
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);

  // Support navigation state updates if navigated while already mounted
  const [prevNavState, setPrevNavState] = useState(location.state);
  if (location.state !== prevNavState) {
    setPrevNavState(location.state);
    const navState = location.state as { openCreateModal?: boolean } | null;
    if (navState?.openCreateModal && isAdmin) {
      setCreateModalOpen(true);
    }
  }

  // Clear navigation state so future route visits or refreshes do not re-open the modal
  useEffect(() => {
    const navState = location.state as { openCreateModal?: boolean } | null;
    if (navState?.openCreateModal) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Synchronize local input when searchQuery changes externally (e.g. clearFilters)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    setSearchInput(searchQuery);
  }

  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  // Sync debounced search to Redux searchQuery
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearch));
    }
  }, [debouncedSearch, searchQuery, dispatch]);

  useEffect(() => {
    dispatch(
      fetchTickets({
        page,
        limit,
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery.trim() || undefined,
      }),
    );
  }, [
    dispatch,
    page,
    limit,
    statusFilter,
    priorityFilter,
    searchQuery,
    refreshTrigger,
  ]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (!val && searchQuery !== "") {
      dispatch(setSearchQuery(""));
    }
  };

  const handleSearchSubmit = () => {
    const trimmed = searchInput.trim();
    if (trimmed !== searchQuery) {
      dispatch(setSearchQuery(trimmed));
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    navigate(`/tickets/${ticket._id}`, { state: { ticket } });
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setCreateModalOpen(true);
  };

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    setDeletingTicket(ticket);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingTicket(null);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    dispatch(clearFilters());
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStatusChange = (val?: TicketStatus) => {
    dispatch(setStatusFilter(val));
  };

  const handlePriorityChange = (val?: TicketPriority) => {
    dispatch(setPriorityFilter(val));
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    dispatch(setPagination({ page: newPage, limit: newPageSize }));
  };



  const renderUserBadge = (
    userRef: TicketUserSummary | string | undefined | null,
    isAssignee = false,
  ) => {
    if (!userRef) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-normal italic bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md">
          <UserOutlined className="text-[11px]" />
          Unassigned
        </span>
      );
    }

    if (typeof userRef === "object") {
      const initial = getAvatarInitial(userRef.name);
      return (
        <Tooltip title={`${userRef.name} (${userRef.email})`}>
          <div className="inline-flex items-center gap-2 max-w-44">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border ${
                isAssignee
                  ? "bg-purple-100 text-purple-700 border-purple-200/80"
                  : "bg-gray-100 text-gray-600 border-gray-200/80"
              }`}
            >
              {initial}
            </div>
            <span className="text-xs font-medium text-gray-800 truncate">
              {userRef.name}
            </span>
          </div>
        </Tooltip>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-normal bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md">
        <UserOutlined className="text-[11px] text-gray-400" />
        {isAssignee ? "Assigned Agent" : "User"}
      </span>
    );
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: "Ticket Details",
      dataIndex: "title",
      key: "title",
      width: 320,
      render: (_title: string, record: Ticket) => (
        <div
          className="flex items-center py-1 cursor-pointer group"
          onClick={() => handleViewTicket(record)}
        >
          <Tooltip title={record.title} placement="topLeft">
            <span className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-purple-700 transition-colors truncate">
              {record.title}
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: TicketStatus) => (
        <span className="inline-flex"><TicketStatusBadge status={status} /></span>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      render: (priority: TicketPriority) => (
        <span className="inline-flex"><TicketPriorityBadge priority={priority} /></span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 165,
      render: (dueDate: string | null | undefined, record: Ticket) =>
        renderDueDateBadge(dueDate, record.status),
    },
    {
      title: "Created By",
      dataIndex: "createdById",
      key: "createdById",
      width: 165,
      render: (createdById: TicketUserSummary | string) =>
        renderUserBadge(createdById, false),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedToId",
      key: "assignedToId",
      width: 175,
      render: (assignedToId?: TicketUserSummary | string | null) =>
        renderUserBadge(assignedToId, true),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (createdAt: string) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap tabular-nums">
          <CalendarOutlined className="text-[11px] text-gray-400" />
          {formatDate(createdAt)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 125,
      align: "center",
      render: (_: unknown, record: Ticket) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="View ticket details">
            <Button
              type="text"
              size="small"
              onClick={() => handleViewTicket(record)}
              icon={
                <EyeOutlined className="text-gray-400 group-hover:text-purple-600 text-sm" />
              }
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-colors text-gray-500 hover:text-purple-700"
              aria-label="View ticket"
            />
          </Tooltip>

          {isAdmin && (
            <>
              <Tooltip title="Edit ticket">
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleEditTicket(record)}
                  icon={
                    <EditOutlined className="text-gray-400 group-hover:text-purple-600 text-sm" />
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-colors text-gray-500 hover:text-purple-700"
                  aria-label="Edit ticket"
                />
              </Tooltip>

              <Tooltip title="Delete ticket">
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleDeleteTicket(record)}
                  icon={
                    <DeleteOutlined className="text-gray-400 group-hover:text-rose-600 text-sm" />
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 transition-colors text-gray-500 hover:text-rose-600"
                  aria-label="Delete ticket"
                />
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  const hasActiveFilters = Boolean(
    statusFilter || priorityFilter || searchQuery.trim(),
  );

  return (
    <div className="pb-8">
      <style>{`
        .solvix-tickets-table .ant-table {
          background: transparent;
        }
        .solvix-tickets-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 16px !important;
          white-space: nowrap !important;
        }
        .solvix-tickets-table .ant-table-tbody > tr > td {
          padding: 13px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          vertical-align: middle !important;
        }
        .solvix-tickets-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .solvix-tickets-table .ant-table-tbody > tr:hover > td {
          background-color: #fcfaff !important;
        }
        .solvix-tickets-table .ant-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 m-0">
              Support Tickets
            </h1>
            {!loading && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 tabular-nums">
                {total} {total === 1 ? "Ticket" : "Tickets"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 m-0">
            {isAdmin
              ? "Manage, prioritize, and assign tickets across the organization."
              : "View and manage tickets assigned to your support queue."}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Button
              type="default"
              icon={<DeleteOutlined className="text-gray-500" />}
              onClick={() => navigate(ROUTES.DELETED_TICKETS)}
              className="h-10 px-3.5 text-xs font-medium text-gray-700 bg-white border-gray-200 hover:border-purple-300 hover:text-purple-600 rounded-lg shadow-2xs transition-colors"
            >
              Deleted Tickets
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTicket}
              className="h-10 px-4 font-semibold bg-purple-600 hover:bg-purple-700 border-purple-600 shadow-sm hover:shadow transition-all"
            >
              Create Ticket
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs px-4 py-3 mb-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Input
              placeholder="Search tickets..."
              prefix={<SearchOutlined className="text-gray-400 text-sm" />}
              value={searchInput}
              onChange={handleSearchChange}
              onPressEnter={handleSearchSubmit}
              allowClear
              className="w-full sm:w-64 md:w-72 h-10 rounded-lg text-sm"
            />

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider select-none mr-1">
              <FilterOutlined className="text-purple-600 text-xs" />
              <span>Filters</span>
            </span>

            <Select<string>
              value={statusFilter ?? "ALL"}
              onChange={(val) => {
                handleStatusChange(
                  val === "ALL" || !val ? undefined : (val as TicketStatus),
                );
              }}
              className="w-36 sm:w-44"
              popupMatchSelectWidth={false}
              options={[
                { label: "All Statuses", value: "ALL" },
                { label: "Open", value: "OPEN" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Resolved", value: "RESOLVED" },
                { label: "Closed", value: "CLOSED" },
              ]}
            />

            <Select<string>
              value={priorityFilter ?? "ALL"}
              onChange={(val) => {
                handlePriorityChange(
                  val === "ALL" || !val ? undefined : (val as TicketPriority),
                );
              }}
              className="w-36 sm:w-44"
              popupMatchSelectWidth={false}
              options={[
                { label: "All Priorities", value: "ALL" },
                { label: "High Priority", value: "HIGH" },
                { label: "Medium Priority", value: "MEDIUM" },
                { label: "Low Priority", value: "LOW" },
              ]}
            />

            {hasActiveFilters && (
              <Button
                type="text"
                size="middle"
                onClick={handleResetFilters}
                icon={<ClearOutlined />}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 h-10 px-3 rounded-lg border border-purple-100 transition-colors"
              >
                Reset Filters
              </Button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <Tooltip title="Refresh ticket list">
              <Button
                type="default"
                onClick={handleRefresh}
                icon={
                  <ReloadOutlined spin={loading} className="text-gray-500" />
                }
                disabled={loading}
                className="h-10 px-4 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:border-purple-400 hover:text-purple-600 rounded-lg shadow-2xs transition-colors"
              >
                Refresh
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Failed to load tickets"
          description={errorMessage}
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
          }
          className="mb-6 rounded-xl border border-red-100 shadow-2xs"
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <Table<Ticket>
          rowKey="_id"
          columns={columns}
          dataSource={tickets}
          loading={loading}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: hasActiveFilters ? (
              <div className="py-12 text-center">
                <SearchOutlined className="text-3xl text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700 m-0">
                  No tickets found
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  No tickets matched your current search criteria and filters.
                </p>
                <Button
                  type="link"
                  size="small"
                  onClick={handleResetFilters}
                  className="mt-2 text-purple-600 hover:text-purple-700 p-0"
                >
                  Clear all filters
                </Button>
              </div>
            ) : undefined,
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (totalCount, range) => (
              <span className="text-xs text-gray-500 font-normal">
                Showing{" "}
                <strong className="text-gray-700 font-semibold">
                  {range[0]}-{range[1]}
                </strong>{" "}
                of <strong className="text-gray-700 font-semibold">{totalCount}</strong>{" "}
                tickets
              </span>
            ),
            onChange: handlePageChange,
            className:
              "!px-4 !py-3 !my-0 border-t border-gray-100 bg-gray-50/40",
          }}
          className="solvix-tickets-table"
        />
      </div>

      {isAdmin && (
        <>
          <TicketModal
            open={createModalOpen}
            ticket={editingTicket}
            onClose={handleCloseModal}
            onSuccess={handleRefresh}
          />

          <DeleteTicketModal
            open={deleteModalOpen}
            ticket={deletingTicket}
            onClose={handleCloseDeleteModal}
            onSuccess={handleRefresh}
          />
        </>
      )}
    </div>
  );
};

export default TicketsPage;
