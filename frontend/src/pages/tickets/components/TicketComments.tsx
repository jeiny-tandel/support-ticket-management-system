import React, { useEffect, useState, useRef } from "react";
import { Input, Tag, Spin, Alert, Tooltip, message as antdMessage } from "antd";
import {
  SendOutlined,
  MessageOutlined,
  LockOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import {
  selectCurrentUser,
  selectUserRole,
  selectComments,
  selectCommentsLoading,
  selectCommentsSubmitting,
  selectCommentsError,
  selectCommentSubmitError,
  fetchComments,
  createComment,
  commentReceived,
  clearComments,
  clearCommentErrors,
} from "../../../store";
import { socketService } from "../../../services";
import type { TicketComment, TicketUserSummary } from "../../../types";
import { Button } from "../../../components/common";
import { getRelativeTime } from "../../../utils";

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
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === "ADMIN";

  // Admins can comment on any ticket; agents only on assigned tickets
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

  const comments = useAppSelector(selectComments);
  const loading = useAppSelector(selectCommentsLoading);
  const submitting = useAppSelector(selectCommentsSubmitting);
  const fetchError = useAppSelector(selectCommentsError);
  const reduxSubmitError = useAppSelector(selectCommentSubmitError);
  const [localSubmitError, setLocalSubmitError] = useState<string | null>(null);
  const submitError = localSubmitError || reduxSubmitError;

  const [messageText, setMessageText] = useState<string>("");

  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ticketId) return;

    dispatch(fetchComments(ticketId));
    socketService.connect();

    const unsubscribe = socketService.onCommentCreated(
      (newComment: TicketComment) => {
        if (newComment && newComment.ticketId === ticketId) {
          dispatch(commentReceived(newComment));
        }
      },
    );

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

    return () => {
      unsubscribe();
      socketService.leaveTicketRoom(ticketId).catch(() => {});
      dispatch(clearComments());
    };
  }, [ticketId, dispatch]);

  const handleClearSubmitError = () => {
    setLocalSubmitError(null);
    dispatch(clearCommentErrors());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleClearSubmitError();

    const trimmed = messageText.trim();
    if (!trimmed) {
      setLocalSubmitError("Comment message cannot be empty.");
      return;
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setLocalSubmitError(
        `Comment message cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
      );
      return;
    }

    const resultAction = await dispatch(
      createComment({
        ticketId,
        payload: { message: trimmed },
      }),
    );

    if (createComment.fulfilled.match(resultAction)) {
      setMessageText("");
      antdMessage.success("Comment added successfully");
      // Scroll to bottom of comments
      if (commentsContainerRef.current) {
        commentsContainerRef.current.scrollTop =
          commentsContainerRef.current.scrollHeight;
      }
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
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header with comment count badge and subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <MessageOutlined className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider m-0 select-none">
                Discussion & Internal Notes
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70 tabular-nums">
                {comments.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 m-0 mt-0.5">
              Live updates shared across authorized support staff in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-200/60 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[11px]">Real-time Sync</span>
        </div>
      </div>

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
        className="space-y-3.5 max-h-125 overflow-y-auto pr-1"
      >
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Spin size="default" />
            <span className="text-xs text-gray-400">Loading comments...</span>
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 text-xl shadow-2xs">
              <MessageOutlined />
            </div>
            <p className="text-sm font-bold text-gray-800 m-0">
              No comments yet
            </p>
            <p className="text-xs text-gray-400 max-w-sm m-0">
              {canComment
                ? "Be the first to post an update, diagnostic note, or customer response on this ticket."
                : "No comments or internal notes have been posted to this ticket yet."}
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
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  isCurrentUser
                    ? "bg-purple-50/30 border-purple-200/90 shadow-2xs hover:bg-purple-50/50"
                    : "bg-white border-gray-200/80 shadow-2xs hover:border-gray-300"
                }`}
              >
                {/* Author Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border select-none ${
                    isCurrentUser
                      ? "bg-purple-600 text-white border-purple-600 ring-2 ring-purple-100 shadow-2xs"
                      : authorIsAdmin
                        ? "bg-purple-100 border-purple-200 text-purple-700"
                        : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  }`}
                >
                  {getAuthorInitial(author)}
                </div>

                {/* Comment Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-900">
                        {author?.name || "Unknown User"}
                      </span>

                      {author?.role && (
                        <Tag
                          color={authorIsAdmin ? "purple" : "blue"}
                          className="m-0 text-[10px] font-semibold px-1.5 py-0 leading-tight rounded-md border"
                        >
                          {authorIsAdmin ? "Admin" : "Support Agent"}
                        </Tag>
                      )}

                      {isCurrentUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                          You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <ClockCircleOutlined className="text-[10px]" />
                      <Tooltip
                        title={new Date(comment.createdAt).toLocaleString()}
                      >
                        <span className="hover:text-gray-600 cursor-default">
                          {getRelativeTime(comment.createdAt)}
                        </span>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {comment.message}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Comment Input Footer */}
      <div className="pt-3 border-t border-gray-100">
        {canComment ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {submitError && (
              <Alert
                type="error"
                showIcon
                closable
                onClose={handleClearSubmitError}
                message={submitError}
                className="rounded-lg text-xs"
              />
            )}

            <div className="space-y-1.5">
              <TextArea
                rows={3}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  if (submitError) handleClearSubmitError();
                }}
                placeholder="Write an internal note or update on this ticket..."
                maxLength={MAX_COMMENT_LENGTH}
                disabled={submitting}
                className="rounded-xl border-gray-200 text-xs sm:text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-200 p-3 leading-relaxed"
              />
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-gray-400">
                  {messageText.length} / {MAX_COMMENT_LENGTH} characters
                </span>
                <span className="text-[11px] text-gray-400">
                  Press Post Comment to broadcast update
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={submitting}
                disabled={!messageText.trim() || submitting}
                className="h-10 px-5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 border-purple-600 shadow-sm"
              >
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500">
            <LockOutlined className="text-gray-400 text-base shrink-0" />
            <div>
              <p className="font-semibold text-gray-700 m-0">
                Commenting Restricted
              </p>
              <p className="text-[11px] text-gray-400 m-0 mt-0.5">
                {userRole === "SUPPORT_AGENT"
                  ? "Only the Support Agent currently assigned to this ticket can post notes and responses."
                  : "You do not have administrative or assignee permissions to comment on this ticket."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketComments;
