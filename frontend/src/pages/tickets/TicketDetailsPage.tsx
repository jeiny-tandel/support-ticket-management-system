import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tag, Alert, Spin, Tooltip, message } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  SyncOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../hooks";
import { selectUserRole, selectCurrentUser } from "../../store";
import { getTicketsApi } from "../../api";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketUserSummary,
} from "../../types";
import { AppButton } from "../../components/common";
import {
  AssignTicketModal,
  UpdateStatusModal,
  TicketComments,
} from "./components";

export const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  // Ticket state (seed from navigation state if available)
  const initialTicket = (location.state as { ticket?: Ticket } | null)?.ticket;
  const [ticket, setTicket] = useState<Ticket | null>(
    initialTicket && initialTicket._id === id ? initialTicket : null,
  );
  const [loading, setLoading] = useState<boolean>(!ticket && Boolean(id));
  const [errorMessage, setErrorMessage] = useState<string | null>(
    !id ? "Invalid ticket ID" : null,
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // If ticket is already populated or ID is invalid, do not initiate fetch
    if (!id || (ticket && ticket._id === id)) {
      return;
    }

    let isMounted = true;

    // Attempt to locate ticket via existing GET /tickets list API
    getTicketsApi({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const found = res.items.find((t) => t._id === id);
        if (found) {
          setTicket(found);
          setLoading(false);
        } else {
          setErrorMessage(
            "Ticket could not be retrieved directly. Note: A dedicated GET /tickets/:id backend API endpoint is not yet implemented; please navigate to this ticket from the Tickets list.",
          );
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to load ticket details.";
        setErrorMessage(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, ticket]);

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

  const handleCopyId = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket._id);
    setCopied(true);
    message.success("Ticket ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusSuccess = (updated?: Ticket) => {
    if (updated) {
      setTicket(updated);
    }
  };

  const handleAssignSuccess = (updated?: Ticket) => {
    if (updated) {
      setTicket(updated);
    }
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

  const renderUserDetail = (
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
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border ${
              isAssignee
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-gray-100 border-gray-200 text-gray-600"
            }`}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 m-0 truncate">
              {userRef.name}
            </p>
            <p className="text-xs text-gray-500 m-0 truncate">
              {userRef.email}
            </p>
          </div>
        </div>
      );
    }

    return (
      <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
        ID: {userRef}
      </span>
    );
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <AppButton
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/tickets")}
          className="h-9 px-3.5 text-xs font-medium text-gray-700 bg-white border-gray-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg shadow-2xs transition-colors"
        >
          Back to Tickets
        </AppButton>

        {ticket && (
          <div className="flex items-center gap-2">
            {/* Action: Update Status (Admin or permitted Support Agent) */}
            {canUpdateStatus(ticket) && (
              <AppButton
                type="default"
                icon={<SyncOutlined />}
                onClick={() => setStatusModalOpen(true)}
                className="h-9 px-3.5 text-xs font-medium text-gray-700 bg-white border-gray-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg shadow-2xs transition-colors"
              >
                Update Status
              </AppButton>
            )}

            {/* Action: Assign or Reassign Agent (Admin only) */}
            {isAdmin && (
              <AppButton
                type="primary"
                icon={<UserOutlined />}
                onClick={() => setAssignModalOpen(true)}
                className="h-9 px-3.5 text-xs font-medium rounded-lg shadow-2xs transition-colors"
              >
                {ticket.assignedToId ? "Reassign Agent" : "Assign Agent"}
              </AppButton>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-16 flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-sm font-medium text-gray-500">
            Loading ticket details...
          </span>
        </div>
      )}

      {/* Error / Not Found state */}
      {!loading && errorMessage && (
        <div className="space-y-4">
          <Alert
            type="warning"
            showIcon
            message="Ticket Not Found"
            description={errorMessage}
            className="rounded-xl border border-amber-200 shadow-2xs text-xs"
          />
          <AppButton
            type="primary"
            onClick={() => navigate("/tickets")}
            className="h-9 px-4 text-xs font-medium"
          >
            Return to Tickets List
          </AppButton>
        </div>
      )}

      {/* Ticket Details View */}
      {!loading && ticket && (
        <div className="space-y-6">
          {/* Ticket Header Card */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-mono font-medium text-gray-400 bg-gray-100/90 border border-gray-200/60 px-2 py-0.5 rounded">
                    #{ticket._id.slice(-6).toUpperCase()}
                  </span>
                  {getStatusTag(ticket.status)}
                  {getPriorityTag(ticket.priority)}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug m-0 wrap-break-word">
                  {ticket.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Tooltip title={copied ? "Copied!" : "Copy Ticket ID"}>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <CheckOutlined className="text-emerald-600" />
                    ) : (
                      <CopyOutlined />
                    )}
                    <span className="font-mono text-[11px]">
                      {ticket._id.slice(-8)}
                    </span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Grid Layout: Main Description + Sidebar Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3 width) - Description and History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Box */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 select-none">
                  Description
                </h2>
                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {ticket.description}
                </div>
              </div>

              {/* Timestamps Box */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 select-none">
                  Activity Timestamps
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CalendarOutlined className="text-gray-400 mt-0.5 text-base" />
                    <div>
                      <p className="text-xs text-gray-500 m-0">Created Date</p>
                      <p className="text-sm font-medium text-gray-800 m-0 mt-0.5">
                        {new Date(ticket.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClockCircleOutlined className="text-gray-400 mt-0.5 text-base" />
                    <div>
                      <p className="text-xs text-gray-500 m-0">Last Updated</p>
                      <p className="text-sm font-medium text-gray-800 m-0 mt-0.5">
                        {new Date(ticket.updatedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Comments & Discussion */}
              <TicketComments
                ticketId={ticket._id}
                assignedToId={ticket.assignedToId}
              />
            </div>

            {/* Right Column (1/3 width) - Ticket Properties */}
            <div className="space-y-6">
              {/* Assignee Card */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider m-0 select-none">
                    Assignee
                  </h2>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setAssignModalOpen(true)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer bg-transparent border-none p-0"
                    >
                      {ticket.assignedToId ? "Change" : "Assign"}
                    </button>
                  )}
                </div>
                {renderUserDetail(ticket.assignedToId, true)}
              </div>

              {/* Creator Card */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 select-none">
                  Created By
                </h2>
                {renderUserDetail(ticket.createdById, false)}
              </div>

              {/* Status & Priority Overview Card */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 space-y-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider m-0 select-none">
                  Ticket Properties
                </h2>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusTag(ticket.status)}
                    {canUpdateStatus(ticket) && (
                      <button
                        type="button"
                        onClick={() => setStatusModalOpen(true)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer bg-transparent border-none p-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Priority</span>
                  <div>{getPriorityTag(ticket.priority)}</div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">System ID</span>
                  <span className="font-mono text-xs text-gray-600 select-all">
                    {ticket._id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          {isAdmin && (
            <AssignTicketModal
              key={`assign-${ticket._id}-${ticket.assignedToId ? "assigned" : "unassigned"}`}
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
        </div>
      )}
    </div>
  );
};

export default TicketDetailsPage;
