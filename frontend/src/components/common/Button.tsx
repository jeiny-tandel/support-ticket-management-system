import React from 'react';
import { Button as AntButton, type ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends AntButtonProps {
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
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

export default Button;
