import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Alert, Tooltip, Input, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector, useDebounce } from "../../hooks";
import {
  selectDeletedTickets,
  selectDeletedTotal,
  selectDeletedPage,
  selectDeletedLimit,
  selectDeletedLoading,
  selectDeletedError,
  fetchDeletedTickets,
  setDeletedPagination,
} from "../../store";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketUserSummary,
} from "../../types";
import { Button, TicketStatusBadge, TicketPriorityBadge } from "../../components/common";
import { getAvatarInitial, formatDate, formatTime } from "../../utils";
import { ROUTES } from "../../constants/routes";

export const DeletedTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const deletedTickets = useAppSelector(selectDeletedTickets);
  const total = useAppSelector(selectDeletedTotal);
  const page = useAppSelector(selectDeletedPage);
  const limit = useAppSelector(selectDeletedLimit);
  const loading = useAppSelector(selectDeletedLoading);
  const errorMessage = useAppSelector(selectDeletedError);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const prevSearchRef = useRef<string>(debouncedSearch);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(
    undefined,
  );
  const [priorityFilter, setPriorityFilter] = useState<
    TicketPriority | undefined
  >(undefined);

  // Fetch deleted tickets from backend with search, filters, and pagination
  useEffect(() => {
    // If debouncedSearch changed and page is not 1 yet, reset page and skip fetching for stale page
    if (prevSearchRef.current !== debouncedSearch) {
      prevSearchRef.current = debouncedSearch;
      if (page !== 1) {
        dispatch(setDeletedPagination({ page: 1, limit }));
        return;
      }
    }

    dispatch(
      fetchDeletedTickets({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter,
        priority: priorityFilter,
      }),
    );
  }, [
    dispatch,
    page,
    limit,
    debouncedSearch,
    statusFilter,
    priorityFilter,
    refreshTrigger,
  ]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    // Search is automatically updated via useDebounce on searchInput
  };

  const handleStatusChange = (val?: TicketStatus) => {
    setStatusFilter(val);
    dispatch(setDeletedPagination({ page: 1, limit }));
  };

  const handlePriorityChange = (val?: TicketPriority) => {
    setPriorityFilter(val);
    dispatch(setDeletedPagination({ page: 1, limit }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    dispatch(setDeletedPagination({ page: 1, limit }));
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    dispatch(setDeletedPagination({ page: newPage, limit: newPageSize }));
  };

  const hasActiveFilters = Boolean(
    searchInput.trim() || statusFilter || priorityFilter,
  );


  const renderUserBadge = (
    userRef: TicketUserSummary | string | undefined | null,
    badgeColor = "purple",
  ) => {
    if (!userRef) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-400 italic">
          —
        </span>
      );
    }

    if (typeof userRef === "object") {
      const initial = getAvatarInitial(userRef.name);
      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full bg-${badgeColor}-50 border border-${badgeColor}-200/80 text-${badgeColor}-700 flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs`}
          >
            {initial}
          </div>
          <span className="text-xs font-medium text-gray-800 truncate max-w-30">
            {userRef.name}
          </span>
        </div>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-normal">
        <UserOutlined className="text-[10px] text-gray-400" />
        User
      </span>
    );
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: "Ticket Details",
      dataIndex: "title",
      key: "title",
      width: 260,
      render: (_: string, record: Ticket) => (
        <div className="py-1">
          <div className="mb-1">
            <span className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
              {record.title}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 m-0 leading-relaxed font-normal">
            {record.description}
          </p>
        </div>
      ),
    },
    {
      title: "Deletion Reason",
      dataIndex: "deletionReason",
      key: "deletionReason",
      width: 280,
      render: (reason?: string | null) => (
        <div className="bg-rose-50/70 border border-rose-200/60 rounded-lg p-2.5">
          <div className="flex items-start gap-1.5">
            <InfoCircleOutlined className="text-rose-500 text-xs mt-0.5 shrink-0" />
            <span className="text-xs text-rose-900 font-medium leading-relaxed wrap-break-word">
              {reason || "No deletion reason recorded."}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Status & Priority",
      key: "statusPriority",
      width: 140,
      render: (_: unknown, record: Ticket) => (
        <div className="flex flex-col gap-1.5 items-start">
          <TicketStatusBadge status={record.status} />
          <TicketPriorityBadge priority={record.priority} />
        </div>
      ),
    },
    {
      title: "Deleted By",
      dataIndex: "deletedById",
      key: "deletedById",
      width: 160,
      render: (deletedById?: TicketUserSummary | string | null) =>
        renderUserBadge(deletedById, "rose"),
    },
    {
      title: "Deleted At",
      dataIndex: "deletedAt",
      key: "deletedAt",
      width: 160,
      render: (deletedAt?: string | null) => {
        if (!deletedAt) return <span className="text-xs text-gray-400">—</span>;
        const d = new Date(deletedAt);
        return (
          <div className="text-xs text-gray-600 flex flex-col">
            <span className="font-medium text-gray-800">
              {formatDate(d)}
            </span>
            <span className="text-[11px] text-gray-400 tabular-nums">
              {formatTime(d)}
            </span>
          </div>
        );
      },
    },
    {
      title: "Creator / Assignee",
      key: "creatorAssignee",
      width: 170,
      render: (_: unknown, record: Ticket) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="text-[11px] text-gray-400 font-medium w-12 shrink-0">
              Created:
            </span>
            {renderUserBadge(record.createdById, "purple")}
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="text-[11px] text-gray-400 font-medium w-12 shrink-0">
              Assigned:
            </span>
            {renderUserBadge(record.assignedToId, "indigo")}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-8">
      <style>{`
        .solvix-deleted-table .ant-table {
          background: transparent;
        }
        .solvix-deleted-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 16px !important;
          white-space: nowrap !important;
        }
        .solvix-deleted-table .ant-table-tbody > tr > td {
          padding: 14px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          vertical-align: middle !important;
        }
        .solvix-deleted-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .solvix-deleted-table .ant-table-tbody > tr:hover > td {
          background-color: #fafbfc !important;
        }
        .solvix-deleted-table .ant-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftOutlined className="text-gray-500 text-sm" />}
              onClick={() => navigate(ROUTES.TICKETS)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Back to active tickets"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 m-0">
              Deleted Tickets
            </h1>
            {!loading && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 tabular-nums">
                {total} {total === 1 ? "Deleted Ticket" : "Deleted Tickets"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 m-0 ml-10">
            Administrative archive of soft-deleted tickets, mandatory deletion
            reasons, and auditing history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Tooltip title="Refresh deleted tickets list">
            <Button
              type="default"
              icon={<ReloadOutlined spin={loading} className="text-gray-500" />}
              onClick={handleRefresh}
              disabled={loading}
              className="h-10 px-3.5 text-xs font-medium text-gray-700 bg-white border-gray-200 hover:border-rose-400 hover:text-rose-600 rounded-lg shadow-2xs transition-colors"
            >
              Refresh
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs px-4 py-3 mb-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <Input
              placeholder="Search deleted tickets..."
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
        </div>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Failed to load deleted tickets"
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
          dataSource={deletedTickets}
          loading={loading}
          scroll={{ x: 1000 }}
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
                of{" "}
                <strong className="text-gray-700 font-semibold">
                  {totalCount}
                </strong>{" "}
                deleted tickets
              </span>
            ),
            onChange: handlePageChange,
            className:
              "!px-4 !py-3 !my-0 border-t border-gray-100 bg-gray-50/40",
          }}
          className="solvix-deleted-table"
          locale={{
            emptyText: hasActiveFilters ? (
              <div className="py-12 text-center">
                <SearchOutlined className="text-4xl text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700 m-0">
                  No deleted tickets found
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  No deleted tickets matched your current search criteria and filters.
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
            ) : (
              <div className="py-12 text-center">
                <DeleteOutlined className="text-4xl text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700 m-0">
                  No deleted tickets found
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  All support tickets are currently active in the organization
                  queue.
                </p>
                <Button
                  type="default"
                  size="small"
                  onClick={() => navigate(ROUTES.TICKETS)}
                  className="mt-3 text-xs"
                >
                  Return to Active Tickets
                </Button>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default DeletedTicketsPage;
