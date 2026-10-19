import React, { useEffect } from "react";
import { Tag, Alert, Empty } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  UserOutlined,
  UserDeleteOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader, Button, Card, TicketStatusBadge, TicketPriorityBadge } from "../../components/common";
import { getAvatarInitial, formatDate } from "../../utils";
import { ROUTES } from "../../constants/routes";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  selectCurrentUser,
  selectUserRole,
  selectTicketSummary,
  selectSummaryLoading,
  selectSummaryError,
  selectRecentTickets,
  selectRecentLoading,
  selectRecentError,
  fetchTicketSummary,
  fetchRecentTickets,
} from "../../store";
import type {
  Ticket,
} from "../../types";
import {
  TicketStatusDonut,
  QueueHealthCard,
  TicketPriorityChart,
  DeadlineOverviewCards,
  UpcomingOverdueCard,
} from "./components";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  const summary = useAppSelector(selectTicketSummary);
  const summaryLoading = useAppSelector(selectSummaryLoading);
  const summaryError = useAppSelector(selectSummaryError);

  const recentTickets = useAppSelector(selectRecentTickets);
  const recentLoading = useAppSelector(selectRecentLoading);
  const recentError = useAppSelector(selectRecentError);

  const isRefreshing = summaryLoading || recentLoading;

  useEffect(() => {
    dispatch(fetchTicketSummary());
    dispatch(fetchRecentTickets());
  }, [dispatch]);

  const handleRefreshAll = () => {
    if (isRefreshing) return;
    dispatch(fetchTicketSummary());
    dispatch(fetchRecentTickets());
  };

  const handleRetrySummary = () => {
    dispatch(fetchTicketSummary());
  };

  const handleRetryRecent = () => {
    dispatch(fetchRecentTickets());
  };

  const handleViewTicket = (ticket: Ticket) => {
    navigate(`/tickets/${ticket._id}`, { state: { ticket } });
  };


  const greeting = currentUser?.name
    ? `Welcome back, ${currentUser.name}`
    : "Welcome to SolviX";

  const subtitle = isAdmin
    ? "Organization-wide overview of support activity, queue health, and ticket lifecycles."
    : "Overview of tickets and workload assigned to your active support queue.";

  const totalTickets = summary?.total ?? 0;

  const getSharePill = (count?: number) => {
    if (typeof count !== "number" || totalTickets === 0) {
      return "0% of total";
    }
    return `${Math.round((count / totalTickets) * 100)}% of total`;
  };

  const baseMetricCards = [
    {
      label: "Total Tickets",
      count: summary?.total,
      subtext: "Workspace total volume",
      shareText: "100% volume",
      valueColor: "text-indigo-950",
      accentBorder: "border-t-4 border-t-indigo-500",
      icon: <InboxOutlined className="text-base" />,
      iconBoxClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      sharePillClass:
        "bg-indigo-50 text-indigo-700 border border-indigo-100/80",
    },
    {
      label: "Open Tickets",
      count: summary?.open,
      subtext: "Awaiting initial triage",
      shareText: getSharePill(summary?.open),
      valueColor: "text-blue-600",
      accentBorder: "border-t-4 border-t-blue-500",
      icon: <ClockCircleOutlined className="text-base" />,
      iconBoxClass: "bg-blue-50 text-blue-600 border border-blue-100",
      sharePillClass: "bg-blue-50 text-blue-700 border border-blue-100/80",
    },
    {
      label: "In Progress",
      count: summary?.inProgress,
      subtext: "Active investigation",
      shareText: getSharePill(summary?.inProgress),
      valueColor: "text-amber-600",
      accentBorder: "border-t-4 border-t-amber-500",
      icon: <SyncOutlined className="text-base" />,
      iconBoxClass: "bg-amber-50 text-amber-600 border border-amber-100",
      sharePillClass: "bg-amber-50 text-amber-700 border border-amber-100/80",
    },
    {
      label: "Resolved",
      count: summary?.resolved,
      subtext: "Successfully verified",
      shareText: getSharePill(summary?.resolved),
      valueColor: "text-emerald-600",
      accentBorder: "border-t-4 border-t-emerald-500",
      icon: <CheckCircleOutlined className="text-base" />,
      iconBoxClass: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      sharePillClass:
        "bg-emerald-50 text-emerald-700 border border-emerald-100/80",
    },
    {
      label: "Closed",
      count: summary?.closed,
      subtext: "Archived & finalized",
      shareText: getSharePill(summary?.closed),
      valueColor: "text-slate-600",
      accentBorder: "border-t-4 border-t-slate-400",
      icon: <CheckOutlined className="text-base" />,
      iconBoxClass: "bg-slate-100 text-slate-600 border border-slate-200",
      sharePillClass: "bg-slate-100 text-slate-700 border border-slate-200/80",
    },
  ];

  const unassignedCard = {
    label: "Unassigned",
    count: summary?.unassigned,
    subtext: "Pending agent assignment",
    shareText: getSharePill(summary?.unassigned),
    valueColor: "text-rose-600",
    accentBorder: "border-t-4 border-t-rose-500",
    icon: <UserDeleteOutlined className="text-base" />,
    iconBoxClass: "bg-rose-50 text-rose-600 border border-rose-100",
    sharePillClass: "bg-rose-50 text-rose-700 border border-rose-100/80",
  };

  const metricCards = isAdmin
    ? [...baseMetricCards, unassignedCard]
    : baseMetricCards;

  return (
    <div className="pb-8">
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
            <Button
              icon={<ReloadOutlined spin={isRefreshing} />}
              loading={isRefreshing}
              disabled={isRefreshing}
              onClick={handleRefreshAll}
              className="h-10 px-3.5"
            >
              Refresh
            </Button>
            {isAdmin && (
              <Link to={ROUTES.TICKETS} state={{ openCreateModal: true }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  className="h-10 px-4 bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  Create Ticket
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {summaryError ? (
        <Alert
          type="error"
          message="Failed to load ticket metrics"
          description={summaryError}
          showIcon
          action={
            <Button size="small" onClick={handleRetrySummary}>
              Retry
            </Button>
          }
          className="mb-5 rounded-xl border border-red-100"
        />
      ) : (
        <section
          className={`mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 ${
            isAdmin ? "xl:grid-cols-6" : "xl:grid-cols-5"
          }`}
        >
          {metricCards.map((item) => (
            <Card
              key={item.label}
              elevated
              className={`bg-white border-gray-200/80 shadow-xs hover:shadow-md transition-all ${item.accentBorder} flex flex-col justify-between`}
              styles={{
                body: {
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  justifyContent: "space-between",
                },
              }}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">
                  {item.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBoxClass}`}
                >
                  {item.icon}
                </div>
              </div>

              {summaryLoading ? (
                <div className="mt-2.5 flex flex-col gap-1.5 animate-pulse">
                  <div className="h-7 w-16 bg-gray-200/80 rounded-md" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              ) : (
                <div className="mt-2 flex-1 flex flex-col justify-end">
                  <div className="flex items-baseline justify-between gap-1.5">
                    <p
                      className={`text-2xl sm:text-3xl font-extrabold tracking-tight m-0 tabular-nums ${item.valueColor}`}
                    >
                      {typeof item.count === "number" ? item.count : 0}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums shrink-0 ${item.sharePillClass}`}
                    >
                      {item.shareText}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400 m-0 font-normal leading-4 min-h-8">
                    {item.subtext}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </section>
      )}

      <DeadlineOverviewCards summary={summary} loading={summaryLoading} />

      <section className="mb-5 grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card
          className="bg-white border-gray-200/80 shadow-xs flex flex-col min-w-0"
          styles={{
            body: {
              padding: "16px 18px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            },
          }}
        >
          <TicketStatusDonut summary={summary} loading={summaryLoading} />
        </Card>

        <Card
          className="bg-white border-gray-200/80 shadow-xs flex flex-col min-w-0"
          styles={{
            body: {
              padding: "16px 18px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            },
          }}
        >
          <TicketPriorityChart summary={summary} loading={summaryLoading} />
        </Card>

        <Card
          className="bg-white border-gray-200/80 shadow-xs flex flex-col min-w-0"
          styles={{
            body: {
              padding: "16px 18px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            },
          }}
        >
          <QueueHealthCard summary={summary} loading={summaryLoading} />
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <UpcomingOverdueCard
          tickets={summary?.urgentTickets ?? []}
          loading={summaryLoading}
          error={summaryError}
          onRetry={handleRetrySummary}
          isAdmin={isAdmin}
        />

        <Card
          className="bg-white border-gray-200/80 shadow-xs flex flex-col h-full"
          styles={{
            body: {
              padding: "8px 18px 16px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
            },
          }}
          title={
            <div className="flex items-center gap-2 py-1">
              <span className="text-base font-bold text-gray-900">
                Recent Tickets
              </span>
              {!recentLoading && !recentError && recentTickets.length > 0 && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/60 tabular-nums">
                  {recentTickets.length} latest
                </span>
              )}
            </div>
          }
        extra={
          <Link
            to={ROUTES.TICKETS}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group/link"
          >
            <span>View all tickets</span>
            <RightOutlined className="text-[10px] group-hover/link:translate-x-0.5 transition-transform" />
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
              <Button size="small" onClick={handleRetryRecent}>
                Retry
              </Button>
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
                <Button
                  type="primary"
                  size="middle"
                  icon={<PlusOutlined />}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  Create Ticket
                </Button>
              </Link>
            )}
          </Empty>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTickets.map((ticket) => {
              const assignee =
                ticket.assignedToId && typeof ticket.assignedToId === "object"
                  ? ticket.assignedToId
                  : null;

              const initial = getAvatarInitial(assignee?.name);

              return (
                <div
                  key={ticket._id}
                  onClick={() => handleViewTicket(ticket)}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-purple-50/40 cursor-pointer transition-all border border-transparent hover:border-purple-100/70"
                  title="Click to view ticket details"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs">
                      <FileTextOutlined className="text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-purple-700 transition-colors m-0 truncate">
                        {ticket.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1 text-gray-400">
                          <CalendarOutlined className="text-[11px]" />
                          {formatDate(ticket.createdAt)}
                        </span>
                        <span className="text-gray-300">•</span>
                        {assignee ? (
                          <span className="inline-flex items-center gap-1.5 text-gray-600 truncate max-w-45">
                            <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                              {initial}
                            </span>
                            <span className="truncate">{assignee.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 italic text-gray-400 bg-gray-50 border border-gray-200/60 px-1.5 py-0.5 rounded text-[11px]">
                            <UserOutlined className="text-[10px]" />
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <TicketPriorityBadge priority={ticket.priority} />
                    <TicketStatusBadge status={ticket.status} />
                    <RightOutlined className="text-xs text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all ml-1 hidden sm:inline-block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  </div>
  );
};

export default DashboardPage;
