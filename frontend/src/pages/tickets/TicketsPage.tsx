import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tag, Select, Alert, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../hooks";
import { selectUserRole } from "../../store";
import { getTicketsApi } from "../../api";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketUserSummary,
} from "../../types";
import { AppButton } from "../../components/common";
import { CreateTicketModal } from "./components";

export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  // Ticket data state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(
    undefined,
  );
  const [priorityFilter, setPriorityFilter] = useState<
    TicketPriority | undefined
  >(undefined);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    getTicketsApi({
      page,
      limit,
      status: statusFilter,
      priority: priorityFilter,
    })
      .then((response) => {
        if (isMounted) {
          setTickets(response.items);
          setTotal(response.total);
          setErrorMessage(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: unknown }).message)
              : "Unable to load tickets. Please try again.";
          setErrorMessage(msg);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page, limit, statusFilter, priorityFilter, refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleViewTicket = (ticket: Ticket) => {
    navigate(`/tickets/${ticket._id}`, { state: { ticket } });
  };

  const handleResetFilters = () => {
    setLoading(true);
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setPage(1);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStatusChange = (val?: TicketStatus) => {
    setLoading(true);
    setStatusFilter(val);
    setPage(1);
  };

  const handlePriorityChange = (val?: TicketPriority) => {
    setLoading(true);
    setPriorityFilter(val);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setLoading(true);
    setPage(newPage);
    setLimit(newPageSize);
  };

  const getStatusTag = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <Tag
            color="blue"
            className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border"
          >
            Open
          </Tag>
        );
      case "IN_PROGRESS":
        return (
          <Tag
            color="orange"
            className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border"
          >
            In Progress
          </Tag>
        );
      case "RESOLVED":
        return (
          <Tag
            color="green"
            className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border"
          >
            Resolved
          </Tag>
        );
      case "CLOSED":
        return (
          <Tag
            color="default"
            className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border text-gray-500 bg-gray-100/80 border-gray-200"
          >
            Closed
          </Tag>
        );
      default:
        return <Tag className="m-0 text-xs rounded-full">{status}</Tag>;
    }
  };

  const getPriorityTag = (priority: TicketPriority) => {
    switch (priority) {
      case "HIGH":
        return (
          <Tag
            color="red"
            className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border"
          >
            High
          </Tag>
        );
      case "MEDIUM":
        return (
          <Tag
            color="gold"
            className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border"
          >
            Medium
          </Tag>
        );
      case "LOW":
        return (
          <Tag
            color="cyan"
            className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border"
          >
            Low
          </Tag>
        );
      default:
        return <Tag className="m-0 text-xs rounded-full">{priority}</Tag>;
    }
  };

  const renderUserBadge = (
    userRef: TicketUserSummary | string | undefined | null,
    isAssignee = false,
  ) => {
    if (!userRef) {
      return (
        <span className="inline-flex items-center text-xs text-gray-400 font-normal italic bg-gray-50 border border-dashed border-gray-200 px-2 py-0.5 rounded">
          Unassigned
        </span>
      );
    }

    if (typeof userRef === "object") {
      const initial = userRef.name ? userRef.name.charAt(0).toUpperCase() : "?";
      return (
        <Tooltip title={userRef.email}>
          <div className="flex items-center gap-2 max-w-37.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 border ${
                isAssignee
                  ? "bg-indigo-50 border-indigo-200/70 text-indigo-600"
                  : "bg-gray-100 border-gray-200/80 text-gray-600"
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
      <span className="font-mono text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
        #{userRef.slice(-6).toUpperCase()}
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
          className="flex items-center gap-2.5 py-1 cursor-pointer group"
          onClick={() => handleViewTicket(record)}
          title="Click to view ticket details"
        >
          <span className="text-xs font-mono font-medium text-gray-400 bg-gray-100/90 border border-gray-200/60 px-1.5 py-0.5 rounded shrink-0">
            #{record._id.slice(-6).toUpperCase()}
          </span>
          <span className="font-medium text-gray-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
            {record.title}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: TicketStatus) => (
        <span className="inline-flex">{getStatusTag(status)}</span>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      render: (priority: TicketPriority) => (
        <span className="inline-flex">{getPriorityTag(priority)}</span>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdById",
      key: "createdById",
      width: 155,
      render: (createdById: TicketUserSummary | string) =>
        renderUserBadge(createdById, false),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedToId",
      key: "assignedToId",
      width: 165,
      render: (assignedToId?: TicketUserSummary | string | null) =>
        renderUserBadge(assignedToId, true),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (createdAt: string) => (
        <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums">
          {new Date(createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_: unknown, record: Ticket) => (
        <Tooltip title="View ticket">
          <AppButton
            type="text"
            size="small"
            onClick={() => handleViewTicket(record)}
            icon={
              <EyeOutlined className="text-gray-500 hover:text-indigo-600 text-base" />
            }
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50/70 transition-colors mx-auto"
            aria-label="View ticket"
          />
        </Tooltip>
      ),
    },
  ];

  const hasActiveFilters = Boolean(statusFilter || priorityFilter);

  return (
    <div className="pb-8">
      {/* Scoped CSS for polished SaaS table styling */}
      <style>{`
        .solvix-tickets-table .ant-table {
          background: transparent;
        }
        .solvix-tickets-table .ant-table-thead > tr > th {
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
        .solvix-tickets-table .ant-table-tbody > tr > td {
          padding: 14px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          vertical-align: middle !important;
        }
        .solvix-tickets-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .solvix-tickets-table .ant-table-tbody > tr:hover > td {
          background-color: #fafbfc !important;
        }
        .solvix-tickets-table .ant-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
      `}</style>

      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 m-0">
            Support Tickets
          </h1>
          <p className="mt-1 text-sm text-gray-500 m-0">
            {isAdmin
              ? "Manage, prioritize, and assign tickets across the organization."
              : "View and manage tickets assigned to your support queue."}
          </p>
        </div>

        {isAdmin && (
          <AppButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            className="h-10 px-4 font-medium shadow-sm hover:shadow transition-all shrink-0 self-start sm:self-auto"
          >
            Create Ticket
          </AppButton>
        )}
      </div>

      {/* 2. Refined Filter and Controls Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs px-4 py-3 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left filters group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider select-none mr-0.5">
              <FilterOutlined className="text-gray-400 text-xs" />
              <span>Filters</span>
            </span>

            {/* Status Filter */}
            <Select<TicketStatus | undefined>
              placeholder="Status: All"
              value={statusFilter}
              onChange={handleStatusChange}
              allowClear
              className="w-36 sm:w-40"
              popupMatchSelectWidth={false}
              options={[
                { label: "All Statuses", value: undefined },
                { label: "Open", value: "OPEN" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Resolved", value: "RESOLVED" },
                { label: "Closed", value: "CLOSED" },
              ]}
            />

            {/* Priority Filter */}
            <Select<TicketPriority | undefined>
              placeholder="Priority: All"
              value={priorityFilter}
              onChange={handlePriorityChange}
              allowClear
              className="w-36 sm:w-40"
              popupMatchSelectWidth={false}
              options={[
                { label: "All Priorities", value: undefined },
                { label: "High Priority", value: "HIGH" },
                { label: "Medium Priority", value: "MEDIUM" },
                { label: "Low Priority", value: "LOW" },
              ]}
            />

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <AppButton
                type="text"
                size="middle"
                onClick={handleResetFilters}
                icon={<ClearOutlined />}
                className="text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/60 h-10 px-2.5 rounded-lg transition-colors"
              >
                Reset
              </AppButton>
            )}
          </div>

          {/* Right actions group */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <Tooltip title="Refresh ticket list">
              <AppButton
                type="default"
                onClick={handleRefresh}
                icon={
                  <ReloadOutlined spin={loading} className="text-gray-500" />
                }
                disabled={loading}
                className="h-10 px-3.5 text-xs font-medium text-gray-700 bg-white border-gray-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg shadow-2xs transition-colors"
              >
                Refresh
              </AppButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Failed to load tickets"
          description={errorMessage}
          action={
            <AppButton size="small" type="primary" onClick={handleRefresh}>
              Retry
            </AppButton>
          }
          className="mb-6 rounded-xl border border-red-100 shadow-2xs"
        />
      )}

      {/* 3. Flush Compact Tickets Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <Table<Ticket>
          rowKey="_id"
          columns={columns}
          dataSource={tickets}
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
                <strong className="text-gray-700">
                  {range[0]}-{range[1]}
                </strong>{" "}
                of <strong className="text-gray-700">{totalCount}</strong>{" "}
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

      {/* Create Ticket Modal for Admin */}
      {isAdmin && (
        <CreateTicketModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default TicketsPage;
