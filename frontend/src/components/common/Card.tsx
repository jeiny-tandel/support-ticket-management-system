import React from 'react';
import { Card as AntCard, type CardProps as AntCardProps } from 'antd';

export interface CardProps extends AntCardProps {
  /** When true, adds subtle elevation hover transition */
  elevated?: boolean;
}

/**
 * Reusable Card component wrapping Ant Design Card with consistent SolviX styling.
 */
export const Card: React.FC<CardProps> = ({
  elevated = false,
  bordered = false,
  className = '',
  children,
  ...rest
}) => {
  const baseClasses =
    'rounded-xl border border-gray-100 shadow-sm transition-shadow';
  const elevatedClasses = elevated ? 'hover:shadow-md' : '';

  return (
    <AntCard
      bordered={bordered}
      className={`${baseClasses} ${elevatedClasses} ${className}`.trim()}
      {...rest}
    >
      {children}
    </AntCard>
  );
};

export default Card;
