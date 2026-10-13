import React from 'react';
import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';

export interface AppButtonProps extends AntButtonProps {
  /** Convenience flag to render button at 100% container width */
  fullWidth?: boolean;
}

/**
 * Reusable SolviX button extending Ant Design Button.
 * Preserves all native Ant Design behavior, HTML button attributes, and loading states.
 */
export const AppButton: React.FC<AppButtonProps> = ({
  fullWidth = false,
  className = '',
  type = 'default',
  children,
  ...rest
}) => {
  const isPrimary = type === 'primary';
  const primaryClasses = isPrimary
    ? 'shadow-sm shadow-indigo-200 font-medium'
    : '';
  const fullWidthClasses = fullWidth ? 'w-full' : '';

  return (
    <AntButton
      type={type}
      className={`${primaryClasses} ${fullWidthClasses} ${className}`.trim()}
      {...rest}
    >
      {children}
    </AntButton>
  );
};

export default AppButton;
