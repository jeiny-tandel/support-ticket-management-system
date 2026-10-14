import React, { useEffect, useState } from "react";
import { Tag, Alert, Empty } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  UserOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader, AppButton, AppCard } from "../../components/common";
import { ROUTES } from "../../constants/routes";
import { useAppSelector } from "../../hooks";
import { selectCurrentUser, selectUserRole } from "../../store";
import { getTicketSummaryApi, getTicketsApi } from "../../api";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketSummaryResponse,
} from "../../types";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  // Summary metrics state
  const [summary, setSummary] = useState<TicketSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryRefresh, setSummaryRefresh] = useState<number>(0);

  // Recent tickets state
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [recentLoading, setRecentLoading] = useState<boolean>(true);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [recentRefresh, setRecentRefresh] = useState<number>(0);

  // Combined refresh state
  const isRefreshing = summaryLoading || recentLoading;

  // Fetch summary metrics
  useEffect(() => {
    let isMounted = true;

    getTicketSummaryApi()
      .then((data) => {
        if (isMounted) {
          setSummary(data);
          setSummaryLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: unknown }).message)
              : "Failed to load ticket metrics.";
          setSummaryError(msg);
          setSummaryLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [summaryRefresh]);

  // Fetch recent tickets (up to 5)
  useEffect(() => {
    let isMounted = true;

    getTicketsApi({ page: 1, limit: 5 })
      .then((res) => {
        if (isMounted) {
          setRecentTickets(res.items);
          setRecentLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message: unknown }).message)
              : "Failed to load recent tickets.";
          setRecentError(msg);
          setRecentLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [recentRefresh]);

  const handleRefreshAll = () => {
    if (isRefreshing) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setRecentLoading(true);
    setRecentError(null);
    setSummaryRefresh((prev) => prev + 1);
    setRecentRefresh((prev) => prev + 1);
  };

  const handleRetrySummary = () => {
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryRefresh((prev) => prev + 1);
  };

  const handleRetryRecent = () => {
    setRecentLoading(true);
    setRecentError(null);
    setRecentRefresh((prev) => prev + 1);
  };

  const handleViewTicket = (ticket: Ticket) => {
    navigate(`/tickets/${ticket._id}`, { state: { ticket } });
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
            className="m-0 text-xs font-medium px-2 py-0.5 rounded-full border"
          >
            High
          </Tag>
        );
      case "MEDIUM":
        return (
          <Tag
            color="gold"
            className="m-0 text-xs font-medium px-2 py-0.5 rounded-full border"
          >
            Medium
          </Tag>
        );
      case "LOW":
        return (
          <Tag
            color="cyan"
            className="m-0 text-xs font-medium px-2 py-0.5 rounded-full border"
          >
            Low
          </Tag>
        );
      default:
        return <Tag className="m-0 text-xs rounded-full">{priority}</Tag>;
    }
  };

  // Header text configuration
  const greeting = currentUser?.name
    ? `Welcome back, ${currentUser.name}`
    : "Welcome to SolviX";

  const subtitle = isAdmin
    ? "Organization-wide overview of support activity and queue health."
    : "Overview of tickets assigned to your support queue.";

  const metricCards = [
    {
      label: "Total Tickets",
      count: summary?.total,
      subtext: "All workspace tickets",
      valueColor: "text-indigo-950",
      icon: <InboxOutlined className="text-base" />,
      iconBoxClass:
        "bg-indigo-50 text-indigo-600 border border-indigo-100/80",
      cardExtraClass:
        "sm:col-span-2 lg:col-span-1 border-indigo-200/70 bg-gradient-to-br from-indigo-50/50 via-white to-white shadow-sm hover:shadow-md",
    },
    {
      label: "Open Tickets",
      count: summary?.open,
      subtext: "Awaiting triage",
      valueColor: "text-blue-600",
      icon: <ClockCircleOutlined className="text-base" />,
      iconBoxClass: "bg-blue-50 text-blue-600 border border-blue-100/80",
      cardExtraClass: "hover:shadow-md",
    },
    {
      label: "In Progress",
      count: summary?.inProgress,
      subtext: "Active investigation",
      valueColor: "text-amber-600",
      icon: <SyncOutlined className="text-base" />,
      iconBoxClass: "bg-amber-50 text-amber-600 border border-amber-100/80",
      cardExtraClass: "hover:shadow-md",
    },
    {
      label: "Resolved",
      count: summary?.resolved,
      subtext: "Successfully solved",
      valueColor: "text-emerald-600",
      icon: <CheckCircleOutlined className="text-base" />,
      iconBoxClass:
        "bg-emerald-50 text-emerald-600 border border-emerald-100/80",
      cardExtraClass: "hover:shadow-md",
    },
    {
      label: "Closed",
      count: summary?.closed,
      subtext: "Archived & finalized",
      valueColor: "text-slate-600",
      icon: <CheckOutlined className="text-base" />,
      iconBoxClass: "bg-slate-100 text-slate-600 border border-slate-200/80",
      cardExtraClass: "hover:shadow-md",
    },
  ];

  return (
    <div>
      {/* 1. Header with greeting, role badge, and actions */}
      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>{greeting}</span>
            {userRole === "ADMIN" ? (
              <Tag
                color="purple"
                className="m-0 font-medium px-2.5 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs"
              >
                Administrator
              </Tag>
            ) : userRole === "SUPPORT_AGENT" ? (
              <Tag
                color="blue"
                className="m-0 font-medium px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs"
              >
                Support Agent
              </Tag>
            ) : null}
          </div>
        }
        subtitle={subtitle}
        extra={
          <div className="flex items-center gap-2.5">
            <AppButton
              icon={<ReloadOutlined spin={isRefreshing} />}
              loading={isRefreshing}
              disabled={isRefreshing}
              onClick={handleRefreshAll}
              className="h-10 px-3.5"
            >
              Refresh
            </AppButton>
            {isAdmin && (
              <Link to={ROUTES.TICKETS} state={{ openCreateModal: true }}>
                <AppButton
                  type="primary"
                  icon={<PlusOutlined />}
                  className="h-10 px-4"
                >
                  Create Ticket
                </AppButton>
              </Link>
            )}
          </div>
        }
      />

      {/* 2. Metric Cards Section */}
      {summaryError ? (
        <Alert
          type="error"
          message="Failed to load ticket metrics"
          description={summaryError}
          showIcon
          action={
            <AppButton size="small" onClick={handleRetrySummary}>
              Retry
            </AppButton>
          }
          className="mb-8"
        />
      ) : (
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metricCards.map((item) => (
            <AppCard
              key={item.label}
              elevated
              className={`transition-all ${item.cardExtraClass || ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.iconBoxClass}`}
                >
                  {item.icon}
                </div>
              </div>

              {summaryLoading ? (
                <div className="mt-3 flex flex-col gap-1.5 animate-pulse">
                  <div className="h-8 w-16 bg-gray-200/80 rounded-md" />
                  <div className="h-3 w-28 bg-gray-100 rounded" />
                </div>
              ) : (
                <div className="mt-2.5">
                  <p
                    className={`text-3xl font-bold tracking-tight m-0 tabular-nums ${item.valueColor}`}
                  >
                    {typeof item.count === "number" ? item.count : 0}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 m-0 font-normal">
                    {item.subtext}
                  </p>
                </div>
              )}
            </AppCard>
          ))}
        </section>
      )}

      {/* 3. Recent Tickets Section */}
      <AppCard
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">
              Recent Tickets
            </span>
            {!recentLoading && !recentError && recentTickets.length > 0 && (
              <span className="text-xs font-normal text-gray-400">
                ({recentTickets.length} latest)
              </span>
            )}
          </div>
        }
        extra={
          <Link
            to={ROUTES.TICKETS}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/link"
          >
            <span>View all</span>
            <RightOutlined className="text-[11px] group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        }
      >
        {recentLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="py-3.5 flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-16 h-6 bg-gray-200/80 rounded shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="w-2/5 h-4 bg-gray-200/80 rounded" />
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-14 h-5 bg-gray-100 rounded-full" />
                  <div className="w-18 h-5 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : recentError ? (
          <Alert
            type="error"
            message="Failed to load recent tickets"
            description={recentError}
            showIcon
            action={
              <AppButton size="small" onClick={handleRetryRecent}>
                Retry
              </AppButton>
            }
          />
        ) : recentTickets.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 m-0">
                  {isAdmin
                    ? "No tickets have been created yet"
                    : "No tickets in your queue"}
                </p>
                <p className="text-xs text-gray-400 m-0">
                  {isAdmin
                    ? "Get started by creating your organization's first support ticket."
                    : "Tickets assigned to your account will automatically appear here."}
                </p>
              </div>
            }
            className="py-10 my-0"
          >
            {isAdmin && (
              <Link to={ROUTES.TICKETS} state={{ openCreateModal: true }}>
                <AppButton
                  type="primary"
                  size="middle"
                  icon={<PlusOutlined />}
                  className="mt-2"
                >
                  Create Ticket
                </AppButton>
              </Link>
            )}
          </Empty>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTickets.map((ticket) => {
              const assigneeName =
                ticket.assignedToId && typeof ticket.assignedToId === "object"
                  ? ticket.assignedToId.name
                  : null;

              return (
                <div
                  key={ticket._id}
                  onClick={() => handleViewTicket(ticket)}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5 px-3 -mx-3 rounded-lg hover:bg-indigo-50/40 cursor-pointer transition-all border border-transparent hover:border-indigo-100/60"
                  title="Click to view ticket details"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100/90 border border-gray-200/80 px-2 py-0.5 rounded shrink-0">
                      #{ticket._id.slice(-6).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-900 group-hover:text-indigo-600 transition-colors m-0 truncate">
                        {ticket.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                        <span>
                          {new Date(ticket.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                        {assigneeName ? (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1 text-gray-500 truncate max-w-45">
                              <UserOutlined className="text-[10px] text-gray-400" />
                              <span className="truncate">{assigneeName}</span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="italic text-gray-400">
                              Unassigned
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {getPriorityTag(ticket.priority)}
                    {getStatusTag(ticket.status)}
                    <RightOutlined className="text-xs text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all ml-1 hidden sm:inline-block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AppCard>
    </div>
  );
};

export default DashboardPage;
