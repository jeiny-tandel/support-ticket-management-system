import React from 'react';
import { Tag } from 'antd';
import type { TicketStatus } from '../../types';

interface StatusBadgeConfig {
  label: string;
  color: string;
  className: string;
}

const STATUS_CONFIG: Record<TicketStatus, StatusBadgeConfig> = {
  OPEN: {
    label: 'Open',
    color: 'blue',
    className:
      'm-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200/80 bg-blue-50/80 text-blue-700',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'orange',
    className:
      'm-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'green',
    className:
      'm-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 text-emerald-700',
  },
  CLOSED: {
    label: 'Closed',
    color: 'default',
    className:
      'm-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-600 bg-slate-100/90',
  },
};

export interface TicketStatusBadgeProps {
  status: TicketStatus | string;
  className?: string;
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = STATUS_CONFIG[status as TicketStatus];

  if (!config) {
    return (
      <Tag className={`m-0 text-xs rounded-full ${className}`.trim()}>
        {status}
      </Tag>
    );
  }

  return (
    <Tag
      color={config.color}
      className={`${config.className} ${className}`.trim()}
    >
      {config.label}
    </Tag>
  );
};

export default TicketStatusBadge;
