import React from 'react';
import { Tag } from 'antd';
import type { TicketPriority } from '../../types';

interface PriorityBadgeConfig {
  label: string;
  color: string;
  className: string;
}

const PRIORITY_CONFIG: Record<TicketPriority, PriorityBadgeConfig> = {
  HIGH: {
    label: 'High',
    color: 'red',
    className:
      'm-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-rose-200/80 bg-rose-50/80 text-rose-700',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'gold',
    className:
      'm-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/80 bg-amber-50/80 text-amber-700',
  },
  LOW: {
    label: 'Low',
    color: 'cyan',
    className:
      'm-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200/80 bg-teal-50/80 text-teal-700',
  },
};

export interface TicketPriorityBadgeProps {
  priority: TicketPriority | string;
  className?: string;
  showSuffix?: boolean;
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({
  priority,
  className = '',
  showSuffix = false,
}) => {
  const config = PRIORITY_CONFIG[priority as TicketPriority];

  if (!config) {
    return (
      <Tag className={`m-0 text-xs rounded-full ${className}`.trim()}>
        {priority}
      </Tag>
    );
  }

  const label = showSuffix ? `${config.label} Priority` : config.label;
  const baseClassName = showSuffix
    ? config.className.replace('font-semibold', 'font-bold')
    : config.className;

  return (
    <Tag
      color={config.color}
      className={`${baseClassName} ${className}`.trim()}
    >
      {label}
    </Tag>
  );
};

export default TicketPriorityBadge;
