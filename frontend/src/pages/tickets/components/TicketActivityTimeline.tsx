import React, { useState } from 'react';
import {
  HistoryOutlined,
  PlusCircleOutlined,
  MessageOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import type { Ticket, TicketComment, TicketUserSummary } from '../../../types';
import { formatDueDate, getRelativeTime } from '../../../utils';

export interface TicketActivityTimelineProps {
  ticket: Ticket;
  comments: TicketComment[];
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'comment' | 'updated' | 'deleted';
  timestamp: string;
  title: string;
  actor?: string;
  actorRole?: string;
  description?: string;
  icon: React.ReactNode;
  iconClass: string;
}

export const TicketActivityTimeline: React.FC<TicketActivityTimelineProps> = ({
  ticket,
  comments,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getActorName = (actor?: TicketUserSummary | string | null): string => {
    if (!actor) return 'System';
    if (typeof actor === 'object' && actor.name) {
      return actor.name;
    }
    return 'User';
  };

  // Compile derived events from ticket & comments
  const events: TimelineEvent[] = [];

  // 1. Creation event
  events.push({
    id: `event-created-${ticket._id}`,
    type: 'created',
    timestamp: ticket.createdAt,
    title: 'Ticket Created',
    actor: getActorName(ticket.createdById),
    description: `Ticket created with ${ticket.priority} priority. Target deadline: ${formatDueDate(
      ticket.dueDate,
    )}.`,
    icon: <PlusCircleOutlined />,
    iconClass: 'bg-purple-100 text-purple-700 border-purple-200',
  });

  // 2. Comments events
  comments.forEach((c) => {
    const authorName = c.authorId?.name || 'User';
    const authorRole = c.authorId?.role || 'Agent';
    const snippet =
      c.message.length > 90 ? `${c.message.slice(0, 90)}...` : c.message;

    events.push({
      id: `event-comment-${c._id}`,
      type: 'comment',
      timestamp: c.createdAt,
      title: 'Comment Added',
      actor: authorName,
      actorRole: authorRole,
      description: `"${snippet}"`,
      icon: <MessageOutlined />,
      iconClass:
        authorRole === 'ADMIN'
          ? 'bg-purple-100 text-purple-700 border-purple-200'
          : 'bg-indigo-100 text-indigo-700 border-indigo-200',
    });
  });

  // 3. Updated event if modified after creation
  const createdMs = new Date(ticket.createdAt).getTime();
  const updatedMs = new Date(ticket.updatedAt).getTime();
  if (!isNaN(createdMs) && !isNaN(updatedMs) && updatedMs - createdMs > 60000) {
    events.push({
      id: `event-updated-${ticket._id}`,
      type: 'updated',
      timestamp: ticket.updatedAt,
      title: 'Ticket State Synchronized',
      actor: 'Platform',
      description: `Ticket active at ${ticket.status} status.`,
      icon: <SyncOutlined />,
      iconClass: 'bg-amber-100 text-amber-700 border-amber-200',
    });
  }

  // 4. Deletion event if soft-deleted
  if (ticket.isDeleted) {
    events.push({
      id: `event-deleted-${ticket._id}`,
      type: 'deleted',
      timestamp: ticket.deletedAt || ticket.updatedAt,
      title: 'Ticket Archived',
      actor: getActorName(ticket.deletedById) || 'Administrator',
      description: `Soft-deleted: "${ticket.deletionReason || 'Archived'}"`,
      icon: <ExclamationCircleOutlined />,
      iconClass: 'bg-rose-100 text-rose-700 border-rose-200',
    });
  }

  // Sort events chronologically (oldest to newest) for history progression
  events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const displayedEvents = isExpanded ? events : events.slice(-4);
  const hasHiddenEvents = events.length > 4;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <HistoryOutlined className="text-purple-600 text-base" />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider m-0 select-none">
            Ticket Activity Timeline ({events.length})
          </h2>
        </div>

        {hasHiddenEvents && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer bg-transparent border-none p-0 transition-colors"
          >
            <span>{isExpanded ? 'Show recent only' : `View all (${events.length})`}</span>
            {isExpanded ? <UpOutlined className="text-[10px]" /> : <DownOutlined className="text-[10px]" />}
          </button>
        )}
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200/80">
        {displayedEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Node Dot */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-xs shadow-2xs ${evt.iconClass}`}
            >
              {evt.icon}
            </div>

            {/* Event Content */}
            <div className="bg-gray-50/70 hover:bg-gray-50 border border-gray-200/60 rounded-xl p-3 sm:p-3.5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-900">
                    {evt.title}
                  </span>
                  {evt.actor && (
                    <span className="text-xs text-gray-600">
                      by <strong className="font-semibold text-gray-800">{evt.actor}</strong>
                    </span>
                  )}
                  {evt.actorRole && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200/60 rounded">
                      {evt.actorRole === 'ADMIN' ? 'Admin' : 'Agent'}
                    </span>
                  )}
                </div>

                <span
                  className="text-[11px] text-gray-400 shrink-0"
                  title={new Date(evt.timestamp).toLocaleString()}
                >
                  {getRelativeTime(evt.timestamp)}
                </span>
              </div>

              {evt.description && (
                <p className="text-xs text-gray-600 m-0 leading-relaxed font-normal">
                  {evt.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketActivityTimeline;
