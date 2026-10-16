import React from 'react';
import { Tag } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { TicketStatus } from '../types';

/**
 * Returns true if a ticket has passed its due date and is not in a completed status (RESOLVED or CLOSED).
 */
export const isTicketOverdue = (
  dueDate?: string | Date | null,
  status?: TicketStatus,
): boolean => {
  if (!dueDate || !status) return false;
  if (status === 'RESOLVED' || status === 'CLOSED') return false;
  const deadline = new Date(dueDate).getTime();
  if (isNaN(deadline)) return false;
  return deadline < Date.now();
};

/**
 * Returns true if a ticket is due within the current calendar day and is not in a completed status (RESOLVED or CLOSED).
 */
export const isTicketDueToday = (
  dueDate?: string | Date | null,
  status?: TicketStatus,
): boolean => {
  if (!dueDate || !status) return false;
  if (status === 'RESOLVED' || status === 'CLOSED') return false;
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  return (
    d.getTime() >= startOfToday.getTime() && d.getTime() <= endOfToday.getTime()
  );
};

/**
 * Returns true if a ticket is due within the next 48 hours, excluding overdue and due today, and is not yet completed.
 */
export const isTicketDueSoon = (
  dueDate?: string | Date | null,
  status?: TicketStatus,
): boolean => {
  if (!dueDate || !status) return false;
  if (status === 'RESOLVED' || status === 'CLOSED') return false;
  const deadline = new Date(dueDate).getTime();
  if (isNaN(deadline)) return false;
  const now = Date.now();
  if (deadline < now) return false;
  if (isTicketDueToday(dueDate, status)) return false;
  return deadline - now <= 48 * 60 * 60 * 1000;
};

/**
 * Formats a due date into a human-readable string (e.g. "Oct 24, 2026").
 */
export const formatDueDate = (dateStr?: string | Date | null): string => {
  if (!dateStr) return 'Not set';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Not set';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Renders an Ant Design Tag visually distinguishing overdue, due today, due soon, upcoming, completed, or unset deadlines.
 */
export const renderDueDateBadge = (
  dueDate?: string | Date | null,
  status?: TicketStatus,
): React.ReactNode => {
  if (!dueDate) {
    return (
      <span className="inline-flex items-center text-xs text-gray-400 font-normal italic">
        Not set
      </span>
    );
  }

  const formattedDate = formatDueDate(dueDate);

  if (status === 'RESOLVED' || status === 'CLOSED') {
    return (
      <Tag className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-200/80 bg-gray-50/80 text-gray-500 inline-flex items-center gap-1.5">
        <CheckCircleOutlined className="text-gray-400 text-[11px]" />
        <span>{formattedDate}</span>
      </Tag>
    );
  }

  if (isTicketOverdue(dueDate, status)) {
    return (
      <Tag
        color="red"
        className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-200/80 bg-rose-50/80 text-rose-700 inline-flex items-center gap-1.5"
      >
        <ClockCircleOutlined className="text-rose-500 text-[11px]" />
        <span>{formattedDate} (Overdue)</span>
      </Tag>
    );
  }

  if (isTicketDueToday(dueDate, status)) {
    return (
      <Tag
        color="orange"
        className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 inline-flex items-center gap-1.5"
      >
        <ClockCircleOutlined className="text-amber-600 text-[11px]" />
        <span>{formattedDate} (Due Today)</span>
      </Tag>
    );
  }

  if (isTicketDueSoon(dueDate, status)) {
    return (
      <Tag
        color="gold"
        className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700 inline-flex items-center gap-1.5"
      >
        <ClockCircleOutlined className="text-amber-500 text-[11px]" />
        <span>{formattedDate} (Due Soon)</span>
      </Tag>
    );
  }

  return (
    <Tag
      color="blue"
      className="m-0 text-xs font-medium px-2.5 py-0.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 text-indigo-700 inline-flex items-center gap-1.5"
    >
      <CalendarOutlined className="text-indigo-500 text-[11px]" />
      <span>{formattedDate}</span>
    </Tag>
  );
};

/**
 * Returns human-readable relative time string (e.g., "5m ago", "2h ago", "3d ago", or "in 2d").
 */
export const getRelativeTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return 'N/A';
  const time = new Date(dateInput).getTime();
  if (isNaN(time)) return 'N/A';
  const diffMs = Date.now() - time;
  const isPast = diffMs >= 0;
  const absDiff = Math.abs(diffMs);

  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (days > 30) {
    return new Date(dateInput).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  if (days > 0) {
    return isPast ? `${days}d ago` : `in ${days}d`;
  }
  if (hours > 0) {
    return isPast ? `${hours}h ago` : `in ${hours}h`;
  }
  if (minutes > 0) {
    return isPast ? `${minutes}m ago` : `in ${minutes}m`;
  }
  return isPast ? 'just now' : 'due now';
};

/**
 * Returns detailed deadline duration information (time remaining or overdue duration).
 */
export const getDeadlineDurationText = (
  dueDate?: string | Date | null,
  status?: TicketStatus,
): { text: string; colorClass: string; isOverdue: boolean } => {
  if (!dueDate) {
    return { text: 'No deadline set', colorClass: 'text-gray-400', isOverdue: false };
  }
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return { text: 'Completed', colorClass: 'text-emerald-600', isOverdue: false };
  }
  const deadline = new Date(dueDate).getTime();
  if (isNaN(deadline)) {
    return { text: 'Not set', colorClass: 'text-gray-400', isOverdue: false };
  }
  const now = Date.now();
  const diff = deadline - now;
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (isOverdue) {
    const text = days > 0 ? `Overdue by ${days}d ${hours}h` : `Overdue by ${hours}h`;
    return { text, colorClass: 'text-rose-600 font-semibold', isOverdue: true };
  }
  if (days === 0 && hours === 0) {
    return { text: 'Due within an hour', colorClass: 'text-amber-600 font-semibold', isOverdue: false };
  }
  if (days === 0) {
    return { text: `Due today (${hours}h left)`, colorClass: 'text-amber-600 font-medium', isOverdue: false };
  }
  return { text: `Due in ${days}d ${hours}h`, colorClass: 'text-indigo-600 font-medium', isOverdue: false };
};

/**
 * Returns formatted ticket age based on creation timestamp.
 */
export const getTicketAge = (createdAt?: string | Date | null): string => {
  if (!createdAt) return 'Unknown';
  const createdTime = new Date(createdAt).getTime();
  if (isNaN(createdTime)) return 'Unknown';
  const diffMs = Date.now() - createdTime;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  return 'Just now';
};

