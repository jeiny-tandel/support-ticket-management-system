import React from 'react';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { Ticket, TicketUserSummary } from '../../../types';
import {
  formatDueDate,
  getRelativeTime,
  getDeadlineDurationText,
  isTicketOverdue,
} from '../../../utils';

export interface TicketMetadataSummaryProps {
  ticket: Ticket;
}

export const TicketMetadataSummary: React.FC<TicketMetadataSummaryProps> = ({
  ticket,
}) => {
  const deadlineInfo = getDeadlineDurationText(ticket.dueDate, ticket.status);
  const overdue = isTicketOverdue(ticket.dueDate, ticket.status);

  const getAssigneeName = (
    assignedTo?: TicketUserSummary | string | null,
  ): string => {
    if (!assignedTo) return 'Unassigned';
    if (typeof assignedTo === 'object' && assignedTo.name) {
      return assignedTo.name;
    }
    return 'Assigned Agent';
  };

  const getAssigneeSubtext = (
    assignedTo?: TicketUserSummary | string | null,
  ): string => {
    if (!assignedTo) return 'Awaiting assignment';
    if (typeof assignedTo === 'object' && assignedTo.email) {
      return assignedTo.email;
    }
    return 'Queue assigned';
  };

  const getCreatorName = (createdById?: TicketUserSummary | string): string => {
    if (!createdById) return 'System';
    if (typeof createdById === 'object' && createdById.name) {
      return createdById.name;
    }
    return 'Customer';
  };

  const getCreatorSubtext = (createdById?: TicketUserSummary | string): string => {
    if (!createdById) return 'Automated';
    if (typeof createdById === 'object' && createdById.email) {
      return createdById.email;
    }
    return 'Ticket Reporter';
  };

  const formattedCreated = new Date(ticket.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const formattedUpdated = new Date(ticket.updatedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const items = [
    {
      label: 'Created',
      value: formattedCreated,
      subtext: `${getRelativeTime(ticket.createdAt)}`,
      icon: <CalendarOutlined className="text-purple-600 text-sm" />,
      iconBg: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Last Updated',
      value: formattedUpdated,
      subtext: `${getRelativeTime(ticket.updatedAt)}`,
      icon: <HistoryOutlined className="text-indigo-600 text-sm" />,
      iconBg: 'bg-indigo-50 text-indigo-700',
    },
    {
      label: 'Due Date',
      value: formatDueDate(ticket.dueDate),
      subtext: deadlineInfo.text,
      subtextClass: deadlineInfo.colorClass,
      icon: (
        <ClockCircleOutlined
          className={`text-sm ${overdue ? 'text-rose-600' : 'text-amber-600'}`}
        />
      ),
      iconBg: overdue
        ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
        : 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Timeline Status',
      value: deadlineInfo.text,
      valueClass: deadlineInfo.colorClass,
      subtext: ticket.dueDate ? 'Based on target SLA' : 'Flexible queue',
      icon: (
        <AlertOutlined
          className={`text-sm ${overdue ? 'text-rose-600' : 'text-teal-600'}`}
        />
      ),
      iconBg: overdue ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-700',
    },
    {
      label: 'Assigned Agent',
      value: getAssigneeName(ticket.assignedToId),
      subtext: getAssigneeSubtext(ticket.assignedToId),
      icon: <UserOutlined className="text-blue-600 text-sm" />,
      iconBg: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Reported By',
      value: getCreatorName(ticket.createdById),
      subtext: getCreatorSubtext(ticket.createdById),
      icon: <SafetyCertificateOutlined className="text-emerald-600 text-sm" />,
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-4 sm:p-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={`flex flex-col justify-between ${
              idx > 0 ? 'pt-2.5 sm:pt-0 sm:pl-3.5' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${item.iconBg}`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 truncate">
                {item.label}
              </span>
            </div>

            <div className="min-w-0">
              <p
                className={`text-xs sm:text-sm font-semibold text-gray-900 m-0 truncate leading-snug ${
                  item.valueClass || ''
                }`}
                title={typeof item.value === 'string' ? item.value : undefined}
              >
                {item.value}
              </p>
              <p
                className={`text-[11px] m-0 mt-0.5 truncate ${
                  item.subtextClass || 'text-gray-400'
                }`}
                title={item.subtext}
              >
                {item.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketMetadataSummary;
