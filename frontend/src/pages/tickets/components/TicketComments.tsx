import React, { useEffect, useState, useRef, useCallback } from "react";
import { Input, Tag, Spin, Alert, message as antdMessage } from "antd";
import { SendOutlined, MessageOutlined, LockOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../hooks";
import { selectCurrentUser, selectUserRole } from "../../../store";
import { getTicketCommentsApi, createTicketCommentApi } from "../../../api";
import { socketService } from "../../../services";
import type { TicketComment, TicketUserSummary } from "../../../types";
import { AppButton } from "../../../components/common";

const { TextArea } = Input;
const MAX_COMMENT_LENGTH = 5000;

export interface TicketCommentsProps {
  ticketId: string;
  assignedToId?: TicketUserSummary | string | null;
}

export const TicketComments: React.FC<TicketCommentsProps> = ({
  ticketId,
  assignedToId,
}) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  // Permission calculation: Admins can comment on any ticket; Agents only on tickets assigned to them
  const currentAssigneeId =
    typeof assignedToId === "object" && assignedToId
      ? assignedToId._id
      : assignedToId
        ? String(assignedToId)
        : null;

  const canComment =
    isAdmin ||
    (userRole === "SUPPORT_AGENT" &&
      Boolean(
        currentAssigneeId &&
        currentUser?.id &&
        currentAssigneeId === currentUser.id,
      ));

  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState<string>("");

  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Helper to merge comments safely without duplicates, preserving chronological order
  const mergeComments = useCallback(
    (incoming: TicketComment | TicketComment[]) => {
      const incomingList = Array.isArray(incoming) ? incoming : [incoming];
      if (incomingList.length === 0) return;

      setComments((prev) => {
        const commentMap = new Map<string, TicketComment>();
        // Add existing comments
        for (const c of prev) {
          commentMap.set(c._id, c);
        }
        // Add or update with incoming comments
        for (const c of incomingList) {
          commentMap.set(c._id, c);
        }
        // Return sorted chronologically
        return Array.from(commentMap.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      });
    },
    [],
  );

  // 1. Initial REST fetch for ticket comments
  useEffect(() => {
    if (!ticketId) return;

    let isMounted = true;

    getTicketCommentsApi(ticketId)
      .then((fetchedComments) => {
        if (!isMounted) return;
        mergeComments(fetchedComments);
        setFetchError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to load comments.";
        setFetchError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [ticketId, mergeComments]);

  // 2. Socket.IO lifecycle: Connect, join room, and listen for real-time comment:created
  useEffect(() => {
    if (!ticketId) return;

    // Connect / verify socket connection
    socketService.connect();

    // Register real-time event listener for comment:created
    const unsubscribe = socketService.onCommentCreated(
      (newComment: TicketComment) => {
        // Ensure event corresponds to this ticket room
        if (newComment && newComment.ticketId === ticketId) {
          mergeComments(newComment);
        }
      },
    );

    // Join the ticket room
    socketService
      .joinTicketRoom(ticketId)
      .then((res) => {
        if (!res.success && res.message) {
          console.warn(`Socket room join notice (${ticketId}):`, res.message);
        }
      })
      .catch((err: unknown) => {
        console.warn("Socket room join error:", err);
      });

    // Clean up room subscription on unmount or ticketId change
    return () => {
      unsubscribe();
      socketService.leaveTicketRoom(ticketId).catch(() => {});
    };
  }, [ticketId, mergeComments]);

  // 3. Handle comment submission via REST API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmed = messageText.trim();
    if (!trimmed) {
      setSubmitError("Comment message cannot be empty.");
      return;
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setSubmitError(
        `Comment message cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await createTicketCommentApi(ticketId, {
        message: trimmed,
      });

      // Clear input on success
      setMessageText("");
      // Merge saved comment (handles case where REST response arrives before/after socket event)
      mergeComments(newComment);
      antdMessage.success("Comment added successfully");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to post comment. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getAuthorInitial = (author?: TicketUserSummary) => {
    if (author?.name) {
      return author.name.charAt(0).toUpperCase();
    }
    return "?";
  };

  const isAuthorAdmin = (author?: TicketUserSummary) => {
    return author?.role === "ADMIN";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <MessageOutlined className="text-indigo-600 text-base" />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider m-0 select-none">
            Ticket Discussion ({comments.length})
          </h2>
        </div>
      </div>

      {/* Fetch Error Alert */}
      {fetchError && (
        <Alert
          type="error"
          showIcon
          message="Unable to load discussion"
          description={fetchError}
          className="rounded-lg text-xs"
        />
      )}

      {/* Comments List */}
      <div
        ref={commentsContainerRef}
        className="space-y-4 max-h-137.5 overflow-y-auto pr-1"
      >
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Spin size="default" />
            <span className="text-xs text-gray-400">Loading comments...</span>
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-gray-400">
            <MessageOutlined className="text-3xl text-gray-300" />
            <p className="text-sm font-medium text-gray-600 m-0">
              No comments yet
            </p>
            <p className="text-xs text-gray-400 m-0">
              {canComment
                ? "Be the first to post an update or note on this ticket."
                : "No comments have been posted to this ticket."}
            </p>
          </div>
        )}

        {!loading &&
          comments.map((comment) => {
            const author = comment.authorId;
            const authorIsAdmin = isAuthorAdmin(author);
            const isCurrentUser =
              currentUser?.id && author?._id === currentUser.id;

            return (
              <div
                key={comment._id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                  isCurrentUser
                    ? "bg-indigo-50/30 border-indigo-100/80"
                    : "bg-gray-50/50 border-gray-100"
                }`}
              >
                {/* Author Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border ${
                    authorIsAdmin
                      ? "bg-purple-100 border-purple-200 text-purple-700"
                      : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  }`}
                >
                  {getAuthorInitial(author)}
                </div>

                {/* Comment Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {author?.name || "Unknown User"}
                      </span>
                      {author?.role && (
                        <Tag
                          color={authorIsAdmin ? "purple" : "blue"}
                          className="m-0 text-[10px] font-medium px-1.5 py-0 leading-tight rounded"
                        >
                          {authorIsAdmin ? "Admin" : "Agent"}
                        </Tag>
                      )}
                      {isCurrentUser && (
                        <span className="text-[10px] text-gray-400 font-normal">
                          (You)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {/* Message content */}
                  <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {comment.message}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Comment Submission Form or Unauthorized Notice */}
      <div className="pt-2 border-t border-gray-100">
        {canComment ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {submitError && (
              <Alert
                type="error"
                showIcon
                closable
                onClose={() => setSubmitError(null)}
                message={submitError}
                className="rounded-lg text-xs"
              />
            )}

            <div className="relative">
              <TextArea
                rows={3}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                placeholder="Write a comment or update on this ticket..."
                maxLength={MAX_COMMENT_LENGTH}
                disabled={submitting}
                className="rounded-lg border-gray-200 text-xs sm:text-sm focus:border-indigo-400"
              />
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-[11px] text-gray-400">
                  {messageText.length}/{MAX_COMMENT_LENGTH} characters
                </span>
                <span className="text-[11px] text-gray-400">
                  Updates broadcast in real-time
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <AppButton
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
                disabled={!messageText.trim() || submitting}
                className="h-9 px-4 text-xs font-medium rounded-lg"
              >
                Post Comment
              </AppButton>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-500">
            <LockOutlined className="text-gray-400 text-sm shrink-0" />
            <span>
              {userRole === "SUPPORT_AGENT"
                ? "Only the Support Agent assigned to this ticket can post comments."
                : "You are not authorized to post comments on this ticket."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketComments;
