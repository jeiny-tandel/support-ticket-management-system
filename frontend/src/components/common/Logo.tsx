import React from 'react';
import { CustomerServiceOutlined } from '@ant-design/icons';

export interface LogoProps {
  /** Size variant for logo and text */
  size?: 'small' | 'middle' | 'large';
  /** Whether to show the "SolviX" brand name text */
  showText?: boolean;
  /** Optional subtitle or tagline */
  subtitle?: string;
  /** Optional container CSS class */
  className?: string;
  /** Optional click handler for navigation */
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'middle',
  showText = true,
  subtitle,
  className = '',
  onClick,
}) => {
  const sizeConfig = {
    small: {
      iconBox: 'h-7 w-7 text-sm rounded-md',
      title: 'text-lg',
      subtitle: 'text-xs',
    },
    middle: {
      iconBox: 'h-9 w-9 text-lg rounded-lg shadow-sm shadow-indigo-200',
      title: 'text-2xl',
      subtitle: 'text-xs',
    },
    large: {
      iconBox: 'h-11 w-11 text-xl rounded-xl shadow-md shadow-indigo-200',
      title: 'text-3xl',
      subtitle: 'text-sm',
    },
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span
        className={`flex items-center justify-center bg-indigo-600 text-white font-bold transition-transform hover:scale-105 ${sizeConfig.iconBox}`}
        aria-hidden="true"
      >
        <CustomerServiceOutlined />
      </span>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold tracking-tight text-indigo-600 leading-tight ${sizeConfig.title}`}
          >
            SolviX
          </span>
          {subtitle && (
            <span
              className={`text-gray-500 font-normal leading-tight ${sizeConfig.subtitle}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
