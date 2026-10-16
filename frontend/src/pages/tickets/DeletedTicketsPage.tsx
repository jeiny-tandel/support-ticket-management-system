import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tag, Alert, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../hooks";
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
import { Button } from "../../components/common";
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

  useEffect(() => {
    dispatch(fetchDeletedTickets({ page, limit }));
  }, [dispatch, page, limit, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    dispatch(setDeletedPagination({ page: newPage, limit: newPageSize }));
  };

  const getStatusTag = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <Tag
            color="blue"
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700"
          >
            Open
          </Tag>
        );
      case "IN_PROGRESS":
        return (
          <Tag
            color="orange"
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700"
          >
            In Progress
          </Tag>
        );
      case "RESOLVED":
        return (
          <Tag
            color="green"
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-700"
          >
            Resolved
          </Tag>
        );
      case "CLOSED":
        return (
          <Tag
            color="default"
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600 bg-slate-100/90"
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
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-200/80 bg-rose-50/80 text-rose-700"
          >
            High
          </Tag>
        );
      case "MEDIUM":
        return (
          <Tag
            color="gold"
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700"
          >
            Medium
          </Tag>
        );
      case "LOW":
        return (
          <Tag
            color="cyan"
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200/80 bg-teal-50/80 text-teal-700"
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
      const initial = userRef.name ? userRef.name.charAt(0).toUpperCase() : "?";
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
          {getStatusTag(record.status)}
          {getPriorityTag(record.priority)}
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
              {d.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-[11px] text-gray-400 tabular-nums">
              {d.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
            emptyText: (
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
