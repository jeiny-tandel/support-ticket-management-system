import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tag, Alert, Empty } from "antd";
import {
  RightOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Card, Button } from "../../../components/common";
import { ROUTES } from "../../../constants/routes";
import {
  isTicketOverdue,
  isTicketDueToday,
  renderDueDateBadge,
} from "../../../utils/ticketDueDate";
import type {
  UrgentTicketSummary,
  TicketPriority,
  TicketStatus,
} from "../../../types";

interface UpcomingOverdueCardProps {
  tickets: UrgentTicketSummary[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  isAdmin: boolean;
}

export const UpcomingOverdueCard: React.FC<UpcomingOverdueCardProps> = ({
  tickets,
  loading,
  error,
  onRetry,
  isAdmin,
}) => {
  const navigate = useNavigate();

  const getStatusTag = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <Tag
            color="blue"
            className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700"
          >
            Open
          </Tag>
        );
      case "IN_PROGRESS":
        return (
          <Tag
            color="orange"
            className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700"
          >
            In Progress
          </Tag>
        );
      case "RESOLVED":
        return (
          <Tag
            color="green"
            className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-700"
          >
            Resolved
          </Tag>
        );
      case "CLOSED":
        return (
          <Tag
            color="default"
            className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 bg-slate-100/90"
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
            className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-200/80 bg-rose-50/80 text-rose-700"
          >
            High
          </Tag>
        );
      case "MEDIUM":
        return (
          <Tag
            color="gold"
            className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700"
          >
            Medium
          </Tag>
        );
      case "LOW":
        return (
          <Tag
            color="cyan"
            className="m-0 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200/80 bg-teal-50/80 text-teal-700"
          >
            Low
          </Tag>
        );
      default:
        return <Tag className="m-0 text-xs rounded-full">{priority}</Tag>;
    }
  };

  // Sort by urgency:
  // 1. Overdue tickets first, oldest deadlines first.
  // 2. Tickets due today, nearest deadline first.
  // 3. Other tickets due soon, nearest deadline first.
  const sortedTickets = React.useMemo(() => {
    return [...tickets].sort((a, b) => {
      const aTime = new Date(a.dueDate).getTime();
      const bTime = new Date(b.dueDate).getTime();
      const aOverdue = isTicketOverdue(a.dueDate, a.status);
      const bOverdue = isTicketOverdue(b.dueDate, b.status);
      const aDueToday = isTicketDueToday(a.dueDate, a.status);
      const bDueToday = isTicketDueToday(b.dueDate, b.status);

      const getTier = (overdue: boolean, dueToday: boolean) => {
        if (overdue) return 1;
        if (dueToday) return 2;
        return 3;
      };

      const tierA = getTier(aOverdue, aDueToday);
      const tierB = getTier(bOverdue, bDueToday);

      if (tierA !== tierB) {
        return tierA - tierB;
      }

      return aTime - bTime;
    });
  }, [tickets]);

  const displayTickets = sortedTickets.slice(0, 5);

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getUrgencyIconBox = (ticket: UrgentTicketSummary) => {
    if (isTicketOverdue(ticket.dueDate, ticket.status)) {
      return {
        className:
          "bg-rose-50 border border-rose-100/80 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
        icon: <ClockCircleOutlined className="text-sm" />,
      };
    }
    if (isTicketDueToday(ticket.dueDate, ticket.status)) {
      return {
        className:
          "bg-amber-50 border border-amber-100/80 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
        icon: <ClockCircleOutlined className="text-sm" />,
      };
    }
    return {
      className:
        "bg-indigo-50 border border-indigo-100/80 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
      icon: <CalendarOutlined className="text-sm" />,
    };
  };

  return (
    <Card
      className="bg-white border-gray-200/80 shadow-xs flex flex-col h-full"
      styles={{ body: { padding: "8px 18px 16px", flex: 1, display: "flex", flexDirection: "column" } }}
      title={
        <div className="flex items-center gap-2 py-1">
          <span className="text-base font-bold text-gray-900">
            Upcoming & Overdue Tickets
          </span>
          {!loading && !error && displayTickets.length > 0 && (
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 tabular-nums">
              {displayTickets.length} urgent
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
      {loading ? (
        <div className="divide-y divide-gray-100 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="py-3 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gray-200/80 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="w-2/5 h-4 bg-gray-200/80 rounded" />
                  <div className="w-32 h-3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-5 bg-gray-100 rounded-full" />
                <div className="w-16 h-5 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-4 flex-1 flex flex-col justify-center">
          <Alert
            type="error"
            message="Failed to load deadline tickets"
            description={error}
            showIcon
            action={
              <Button size="small" onClick={onRetry}>
                Retry
              </Button>
            }
          />
        </div>
      ) : displayTickets.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 m-0">
                  {isAdmin
                    ? "No tickets are currently overdue or approaching deadlines"
                    : "No overdue or upcoming deadlines in your queue"}
                </p>
                <p className="text-xs text-gray-400 m-0">
                  {isAdmin
                    ? "All tickets across your workspace are currently on schedule."
                    : "All tickets assigned to your account are currently on schedule."}
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
        </div>
      ) : (
        <div className="divide-y divide-gray-100 flex-1">
          {displayTickets.map((ticket) => {
            const urgencyVisual = getUrgencyIconBox(ticket);
            const assignee = ticket.assignedToId;
            const initial = assignee?.name
              ? assignee.name.charAt(0).toUpperCase()
              : "?";

            return (
              <div
                key={ticket._id}
                onClick={() => handleTicketClick(ticket._id)}
                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-purple-50/40 cursor-pointer transition-all border border-transparent hover:border-purple-100/70"
                title="Click to view ticket details"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all shadow-2xs ${urgencyVisual.className}`}
                  >
                    {urgencyVisual.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-purple-700 transition-colors m-0 truncate">
                      {ticket.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                      <div>{renderDueDateBadge(ticket.dueDate, ticket.status)}</div>
                      <span className="text-gray-300">•</span>
                      {assignee?.name ? (
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
                  {getPriorityTag(ticket.priority)}
                  {getStatusTag(ticket.status)}
                  <RightOutlined className="text-xs text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all ml-1 hidden sm:inline-block" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default UpcomingOverdueCard;
