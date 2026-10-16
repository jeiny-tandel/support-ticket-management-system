import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tag, Alert, Spin, Tooltip, message } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  SyncOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  EditOutlined,
  FileTextOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  selectUserRole,
  selectCurrentUser,
  selectCurrentTicket,
  selectCurrentTicketLoading,
  selectCurrentTicketError,
  fetchTicketById,
  setCurrentTicket,
  clearCurrentTicket,
  selectComments,
} from "../../store";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketUserSummary,
} from "../../types";
import { Button } from "../../components/common";
import {
  AssignTicketModal,
  UpdateStatusModal,
  CreateTicketModal,
  TicketComments,
  TicketLifecycleProgress,
  TicketMetadataSummary,
  TicketActivityTimeline,
} from "./components";
import {
  renderDueDateBadge,
  isTicketOverdue,
  formatDueDate,
  getTicketAge,
} from "../../utils";

export const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  const ticket = useAppSelector(selectCurrentTicket);
  const isDetailsLoading = useAppSelector(selectCurrentTicketLoading);
  const detailsError = useAppSelector(selectCurrentTicketError);
  const comments = useAppSelector(selectComments);

  const loading = isDetailsLoading && !ticket;
  const errorMessage = !id ? "Invalid ticket ID" : detailsError;
  const [copied, setCopied] = useState<boolean>(false);

  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    // Use initial navigation state for instantaneous optimistic UI if available
    const navTicket = (location.state as { ticket?: Ticket } | null)?.ticket;
    if (navTicket && navTicket._id === id) {
      dispatch(setCurrentTicket(navTicket));
    }

    // Always fetch fresh ticket data from backend to prevent stale data
    dispatch(fetchTicketById(id));

    return () => {
      dispatch(clearCurrentTicket());
    };
  }, [id, dispatch, location.state]);

  const getAssigneeId = (
    assignedTo?: TicketUserSummary | string | null,
  ): string | null => {
    if (!assignedTo) return null;
    if (typeof assignedTo === "object" && "_id" in assignedTo) {
      return assignedTo._id;
    }
    return String(assignedTo);
  };

  const canUpdateStatus = (t: Ticket): boolean => {
    if (t.isDeleted) {
      return false;
    }
    if (isAdmin) {
      return true;
    }
    if (userRole === "SUPPORT_AGENT") {
      const assigneeId = getAssigneeId(t.assignedToId);
      const currentUserId = currentUser?.id;
      return Boolean(
        assigneeId &&
        currentUserId &&
        assigneeId === currentUserId &&
        t.status !== "CLOSED",
      );
    }
    return false;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    message.success("Ticket link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusSuccess = (updated?: Ticket) => {
    if (updated) {
      dispatch(setCurrentTicket(updated));
    }
  };

  const handleEditSuccess = () => {
    if (id) {
      dispatch(fetchTicketById(id));
    }
  };

  const handleAssignSuccess = (updated?: Ticket) => {
    if (updated) {
      dispatch(setCurrentTicket(updated));
    }
  };

  const getStatusTag = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <Tag
            color="blue"
            className="m-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700"
          >
            Open
          </Tag>
        );
      case "IN_PROGRESS":
        return (
          <Tag
            color="orange"
            className="m-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700"
          >
            In Progress
          </Tag>
        );
      case "RESOLVED":
        return (
          <Tag
            color="green"
            className="m-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-700"
          >
            Resolved
          </Tag>
        );
      case "CLOSED":
        return (
          <Tag
            color="default"
            className="m-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600 bg-slate-100/90"
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
            className="m-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200/80 bg-rose-50/80 text-rose-700"
          >
            High Priority
          </Tag>
        );
      case "MEDIUM":
        return (
          <Tag
            color="gold"
            className="m-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700"
          >
            Medium Priority
          </Tag>
        );
      case "LOW":
        return (
          <Tag
            color="cyan"
            className="m-0 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200/80 bg-teal-50/80 text-teal-700"
          >
            Low Priority
          </Tag>
        );
      default:
        return <Tag className="m-0 text-xs rounded-full">{priority}</Tag>;
    }
  };

  const renderUserDetail = (
    userRef: TicketUserSummary | string | undefined | null,
    isAssignee = false,
  ) => {
    if (!userRef) {
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50/80 rounded-xl border border-dashed border-gray-200 text-center">
          <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-2 shadow-2xs">
            <UserOutlined />
          </div>
          <p className="text-xs font-bold text-gray-700 m-0">
            No Agent Assigned
          </p>
          <p className="text-[11px] text-gray-400 m-0 mt-0.5">
            This ticket is awaiting triage or assignment.
          </p>
          {isAdmin && ticket && !ticket.isDeleted && (
            <Button
              type="default"
              size="small"
              icon={<UserOutlined />}
              onClick={() => setAssignModalOpen(true)}
              className="mt-3 text-xs h-8"
            >
              Assign Agent
            </Button>
          )}
        </div>
      );
    }

    if (typeof userRef === "object") {
      const initial = userRef.name ? userRef.name.charAt(0).toUpperCase() : "?";
      return (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border shadow-2xs select-none ${
              isAssignee
                ? "bg-purple-100 border-purple-200 text-purple-700"
                : "bg-indigo-50 border-indigo-200 text-indigo-700"
            }`}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-bold text-gray-900 m-0 truncate">
                {userRef.name}
              </p>
              {userRef.role && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 border border-gray-200/60">
                  {userRef.role === "ADMIN" ? "Admin" : "Agent"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 m-0 truncate mt-0.5">
              {userRef.email}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">
          <UserOutlined />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-800 m-0 truncate">
            {isAssignee ? "Assigned Agent" : "Ticket Creator"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-16 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Header Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/tickets")}
          className="h-10 px-4 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:border-purple-300 hover:text-purple-600 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          Back to Tickets
        </Button>

        {ticket && (
          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {canUpdateStatus(ticket) && (
              <Button
                type="default"
                icon={<SyncOutlined />}
                onClick={() => setStatusModalOpen(true)}
                className="h-10 px-4 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:border-purple-300 hover:text-purple-600 rounded-lg shadow-2xs transition-colors"
              >
                Update Status
              </Button>
            )}

            {isAdmin && !ticket.isDeleted && (
              <>
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => setEditModalOpen(true)}
                  className="h-10 px-4 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:border-purple-300 hover:text-purple-600 rounded-lg shadow-2xs transition-colors"
                >
                  Edit Ticket
                </Button>

                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  onClick={() => setAssignModalOpen(true)}
                  className="h-10 px-4 text-xs font-semibold rounded-lg shadow-sm bg-purple-600 hover:bg-purple-700 border-purple-600"
                >
                  {ticket.assignedToId ? "Reassign Agent" : "Assign Agent"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-16 flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-sm font-medium text-gray-500">
            Loading ticket details...
          </span>
        </div>
      )}

      {!loading && errorMessage && (
        <div className="space-y-4">
          <Alert
            type="warning"
            showIcon
            message="Ticket Not Found"
            description={errorMessage}
            className="rounded-xl border border-amber-200 shadow-2xs text-xs"
          />
          <Button
            type="primary"
            onClick={() => navigate("/tickets")}
            className="h-9 px-4 text-xs font-medium"
          >
            Return to Tickets List
          </Button>
        </div>
      )}

      {!loading && ticket && (
        <div className="space-y-6">
          {/* Soft-deleted notice */}
          {ticket.isDeleted && (
            <Alert
              type="warning"
              showIcon
              message="Archived Soft-Deleted Ticket"
              description={`This ticket has been soft-deleted by an administrator (Reason: "${
                ticket.deletionReason || "No reason specified"
              }"). It is archived and excluded from active support workflows.`}
              className="rounded-xl border border-amber-200/80 bg-amber-50/80 shadow-2xs"
            />
          )}

          {/* Overdue deadline warning if applicable */}
          {isTicketOverdue(ticket.dueDate, ticket.status) && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50/90 border border-rose-200/80 text-rose-800 text-xs shadow-2xs">
              <ClockCircleOutlined className="text-rose-600 text-base shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-rose-900 block">
                  Deadline Passed
                </span>
                <span className="text-rose-700 font-normal">
                  This ticket has passed its target resolution deadline (Target:{" "}
                  {formatDueDate(ticket.dueDate)}). Please prioritize diagnosis
                  and resolution.
                </span>
              </div>
            </div>
          )}

          {/* Ticket Header Card */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Badges Bar */}
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <Tooltip title={`Ticket Document Ref: ${ticket._id}`}>
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 select-all cursor-default">
                      <TagOutlined className="text-[10px]" />#
                      {ticket._id.slice(-6).toUpperCase()}
                    </span>
                  </Tooltip>
                  {getStatusTag(ticket.status)}
                  {getPriorityTag(ticket.priority)}
                  {renderDueDateBadge(ticket.dueDate, ticket.status)}
                </div>

                {/* Main Ticket Title */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-snug m-0 wrap-break-word">
                  {ticket.title}
                </h1>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 shrink-0 self-start">
                <Tooltip
                  title={
                    copied ? "Copied to clipboard!" : "Copy direct ticket link"
                  }
                >
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-purple-700 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-lg px-3 py-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copied ? (
                      <CheckOutlined className="text-emerald-600" />
                    ) : (
                      <LinkOutlined className="text-gray-500" />
                    )}
                    <span className="font-semibold text-xs">
                      {copied ? "Link Copied" : "Copy Link"}
                    </span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Ticket Lifecycle Stepper */}
          <TicketLifecycleProgress status={ticket.status} />

          {/* Ticket Metadata Summary */}
          <TicketMetadataSummary ticket={ticket} />

          {/* Two-Column Responsive Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Main Column (col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Ticket Description */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                      <FileTextOutlined className="text-base" />
                    </div>
                    <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider m-0 select-none">
                      Description & Details
                    </h2>
                  </div>

                  {isAdmin && !ticket.isDeleted && (
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer bg-transparent border-none p-0 transition-colors"
                    >
                      <EditOutlined className="text-[11px]" />
                      <span>Edit Description</span>
                    </button>
                  )}
                </div>

                {ticket.description?.trim() ? (
                  <div className="text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {ticket.description}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs">
                    No description provided for this support ticket.
                  </div>
                )}
              </div>

              {/* Ticket Activity Timeline */}
              <TicketActivityTimeline ticket={ticket} comments={comments} />

              {/* Ticket Comments & Discussion */}
              <TicketComments
                ticketId={ticket._id}
                assignedToId={ticket.assignedToId}
              />
            </div>

            {/* Right Information Column (col-span-4) */}
            <div className="lg:col-span-4 space-y-5">
              {/* Assignment Card */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-gray-100">
                  <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider m-0 select-none">
                    Assignment
                  </h2>
                  {isAdmin && !ticket.isDeleted && (
                    <button
                      type="button"
                      onClick={() => setAssignModalOpen(true)}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer bg-transparent border-none p-0 transition-colors"
                    >
                      {ticket.assignedToId ? "Reassign" : "Assign"}
                    </button>
                  )}
                </div>
                {renderUserDetail(ticket.assignedToId, true)}
              </div>

              {/* Ticket Properties Card */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-3.5">
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider m-0 pb-2.5 border-b border-gray-100 select-none">
                  Ticket Properties
                </h2>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-gray-500 font-medium">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusTag(ticket.status)}
                    {canUpdateStatus(ticket) && (
                      <button
                        type="button"
                        onClick={() => setStatusModalOpen(true)}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer bg-transparent border-none p-0 transition-colors"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">Priority</span>
                  <div>{getPriorityTag(ticket.priority)}</div>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">Due Date</span>
                  <div className="flex items-center gap-2">
                    {renderDueDateBadge(ticket.dueDate, ticket.status)}
                    {isAdmin && !ticket.isDeleted && (
                      <button
                        type="button"
                        onClick={() => setEditModalOpen(true)}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer bg-transparent border-none p-0 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">Ticket Age</span>
                  <span className="text-gray-800 font-semibold tabular-nums">
                    {getTicketAge(ticket.createdAt)}
                  </span>
                </div>
              </div>

              {/* Reporter / Creator Card */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5">
                <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3.5 pb-2.5 border-b border-gray-100 select-none">
                  Reporter
                </h2>
                {renderUserDetail(ticket.createdById, false)}
              </div>
            </div>
          </div>

          {/* Modals for Assignment, Status, and Edit */}
          {isAdmin && (
            <AssignTicketModal
              key={`assign-${ticket._id}-${
                ticket.assignedToId ? "assigned" : "unassigned"
              }`}
              ticket={ticket}
              open={assignModalOpen}
              onClose={() => setAssignModalOpen(false)}
              onSuccess={handleAssignSuccess}
            />
          )}

          <UpdateStatusModal
            key={`status-${ticket._id}-${ticket.status}`}
            ticket={ticket}
            open={statusModalOpen}
            onClose={() => setStatusModalOpen(false)}
            onSuccess={handleStatusSuccess}
          />

          {isAdmin && (
            <CreateTicketModal
              key={`edit-${ticket._id}`}
              ticket={ticket}
              open={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              onSuccess={handleEditSuccess}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TicketDetailsPage;
